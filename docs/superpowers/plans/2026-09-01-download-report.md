# Download Report (Dashboard + Activity Log) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Excel export for dashboard (one sheet per widget) and activity logs, respecting active filters with a 3-month default when no date range is set.

**Architecture:** Pure frontend Excel generation via SheetJS (`xlsx`). Dashboard download re-fetches all widget endpoints with the current filter + date defaults. Activity download re-fetches `/activities` with current filter + date defaults. Backend adds `dateFrom`/`dateTo` query params to the activities endpoint (currently missing — date filtering does not exist there). Both download buttons live in their page headers and are always visible (not gated by permissions).

**Tech Stack:** Next.js 14 (App Router), React, SheetJS (`xlsx`), FastAPI (Python), Zustand (filter store), `date-fns` (already a dep)

**Spec:** Requirements from user conversation — no separate spec doc.

## Global Constraints

- Output format: `.xlsx` only (no CSV, no PDF)
- Default date range when no filter is set: `subMonths(now, 3)` to `now` — applied at download time only (does not affect the main page view)
- Filters respected at download time: `vehicleId`, `serviceType` (activity only), `dateFrom`, `dateTo`
- Dashboard export: 7 sheets — one per widget (names below)
- Activity export: 1 sheet named "Log Aktivitas"
- Column headers in Indonesian
- Cost rate: 1 kWh = Rp 1.114 (hardcoded, matches `EstimasiCostChart`)
- Download button color: `#00714D` (green, distinct from red action buttons)
- Button label: "↓ Unduh Laporan" (dashboard), "↓ Unduh Log" (activity)
- Library: `xlsx` (SheetJS) — NOT yet in `package.json`, must install
- No new backend endpoints — reuse existing `/activities` and `/dashboard/*` routes
- `serviceType` filtering for activity remains client-side (filter after fetch)
- Date strings passed to API: ISO 8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`)

---

### Task 1: Install xlsx + Create Excel Utility

**Files:**
- Modify: `web/package.json` (after `npm install`)
- Create: `web/lib/excel.ts`

**Interfaces:**
- Produces:
  - `defaultDateRange(): { dateFrom: string; dateTo: string }` — last 3 months to now
  - `buildRows(data: Record<string, unknown>[], columns: ColDef[]): (string | number | null)[][]` — header row + data rows
  - `sheetFromRows(rows: (string | number | null)[][]): XLSX.WorkSheet`
  - `downloadWorkbook(wb: XLSX.WorkBook, filename: string): void`

- [ ] **Step 1: Install xlsx**

Run from `web/` directory:
```bash
npm install xlsx
```

Expected: `xlsx` appears in `web/package.json` under `dependencies`.

- [ ] **Step 2: Create `web/lib/excel.ts`**

```typescript
import * as XLSX from "xlsx";
import { subMonths } from "date-fns";

export type ColDef = { key: string; label: string };

export function defaultDateRange(): { dateFrom: string; dateTo: string } {
  const now = new Date();
  return {
    dateFrom: subMonths(now, 3).toISOString(),
    dateTo: now.toISOString(),
  };
}

export function buildRows(
  data: Record<string, unknown>[],
  columns: ColDef[]
): (string | number | null)[][] {
  const header = columns.map((c) => c.label);
  const rows = data.map((row) =>
    columns.map((c) => {
      const val = row[c.key];
      if (val === undefined || val === null) return "-";
      return val as string | number;
    })
  );
  return [header, ...rows];
}

export function sheetFromRows(rows: (string | number | null)[][]): XLSX.WorkSheet {
  return XLSX.utils.aoa_to_sheet(rows);
}

export function downloadWorkbook(wb: XLSX.WorkBook, filename: string): void {
  XLSX.writeFile(wb, filename);
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors on `web/lib/excel.ts`.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json lib/excel.ts
git commit -m "feat: add xlsx utility for Excel report generation"
```

---

### Task 2: Add Date Filtering to Backend Activities Endpoint

**Files:**
- Modify: `api/app/routers/activities.py`

**Interfaces:**
- Consumes: `ActivityLog` SQLAlchemy model — field `date_time` is a `datetime`
- Produces: `GET /activities?dateFrom=ISO&dateTo=ISO` — filters rows to that window

Current endpoint (from exploration):
```python
@router.get("/activities", response_model=List[ActivityLogOut])
async def get_activities(vehicleId: Optional[str] = None, status: Optional[str] = None, db: Session = Depends(get_db)):
```

- [ ] **Step 1: Read `api/app/routers/activities.py`**

Read the full file to confirm existing imports and query logic before editing.

- [ ] **Step 2: Add dateFrom / dateTo params**

Replace the `get_activities` function signature and add date filters. Add `from datetime import datetime` to imports if not present.

```python
from datetime import datetime

@router.get("/activities", response_model=List[ActivityLogOut])
async def get_activities(
    vehicleId: Optional[str] = None,
    status: Optional[str] = None,
    dateFrom: Optional[str] = None,
    dateTo: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(ActivityLog)
    if vehicleId and vehicleId != "all":
        query = query.filter(ActivityLog.vehicle_id == vehicleId)
    if status and status != "all":
        query = query.filter(ActivityLog.status == status)
    if dateFrom:
        dt_from = datetime.fromisoformat(dateFrom.replace("Z", "+00:00"))
        query = query.filter(ActivityLog.date_time >= dt_from)
    if dateTo:
        dt_to = datetime.fromisoformat(dateTo.replace("Z", "+00:00"))
        query = query.filter(ActivityLog.date_time <= dt_to)
    return query.order_by(ActivityLog.date_time.desc()).all()
```

- [ ] **Step 3: Smoke-test endpoint**

With API running on port 8000:
```bash
curl "http://localhost:8000/api/v1/activities?dateFrom=2026-06-01T00:00:00Z&dateTo=2026-09-01T23:59:59Z" | python -m json.tool | head -20
```

Expected: JSON array of activities within that date range (fewer results than without date params).

- [ ] **Step 4: Commit**

```bash
git add api/app/routers/activities.py
git commit -m "feat: add dateFrom/dateTo filter to GET /activities"
```

---

### Task 3: Add Date Fields to Activity Filter Store and Wire ActivityFilters

**Files:**
- Modify: `web/stores/useFilterStore.ts` — add `dateFrom?`, `dateTo?` to activity filter slice
- Modify: `web/lib/services/activity.ts` — pass date params to API call
- Modify: `web/components/activity/ActivityFilters.tsx` — wire date presets to store

**Interfaces:**
- Consumes: current `activityFilter = { serviceType: string; vehicleId: string }`
- Produces: `activityFilter = { serviceType: string; vehicleId: string; dateFrom?: string; dateTo?: string }`

- [ ] **Step 1: Read current files**

Read all three files before editing:
- `web/stores/useFilterStore.ts`
- `web/lib/services/activity.ts`
- `web/components/activity/ActivityFilters.tsx`

- [ ] **Step 2: Update `useFilterStore.ts` — add date fields**

Locate the `activityFilter` slice. Add `dateFrom` and `dateTo` as optional string fields with `undefined` defaults:

```typescript
// In initial state:
activityFilter: {
  serviceType: "all",
  vehicleId: "all",
  dateFrom: undefined as string | undefined,
  dateTo: undefined as string | undefined,
},
```

Update the `ActivityFilter` type (or interface) if it exists separately:
```typescript
export interface ActivityFilter {
  serviceType: string;
  vehicleId: string;
  dateFrom?: string;
  dateTo?: string;
}
```

The `setActivityFilter` action already accepts `Partial<ActivityFilter>` — no change needed there.

- [ ] **Step 3: Update `web/lib/services/activity.ts` — pass dates to API**

Find the `getActivityLogs` function. Update it to append `dateFrom` and `dateTo` to the query string when present, and keep `serviceType` filtering client-side:

```typescript
export async function getActivityLogs(filter: ActivityFilter): Promise<ActivityLog[]> {
  const params = new URLSearchParams();
  if (filter.vehicleId && filter.vehicleId !== "all") {
    params.set("vehicleId", filter.vehicleId);
  }
  if (filter.dateFrom) params.set("dateFrom", filter.dateFrom);
  if (filter.dateTo) params.set("dateTo", filter.dateTo);
  const qs = params.toString();
  const res = await fetch(`/api/v1/activities${qs ? `?${qs}` : ""}`);
  if (!res.ok) return [];
  const data: ActivityLog[] = await res.json();
  if (filter.serviceType && filter.serviceType !== "all") {
    return data.filter((l) => l.serviceType === filter.serviceType);
  }
  return data;
}
```

- [ ] **Step 4: Wire ActivityFilters date presets to store**

In `web/components/activity/ActivityFilters.tsx`, find where date presets are applied (the preset button onClick handlers). Change them to call `setActivityFilter({ dateFrom, dateTo })` instead of local state:

```typescript
const { activityFilter, setActivityFilter } = useFilterStore();

// When a preset is selected (find the existing handler):
function applyPreset(from: Date, to: Date) {
  setActivityFilter({ dateFrom: from.toISOString(), dateTo: to.toISOString() });
}

// When date is cleared:
function clearDate() {
  setActivityFilter({ dateFrom: undefined, dateTo: undefined });
}
```

If date state was previously purely local (e.g. `useState`), replace those `useState` declarations with reads from `activityFilter.dateFrom` / `activityFilter.dateTo` from the store.

- [ ] **Step 5: Verify activity page still works**

Run dev server. Open `/activity`:
- Logs load normally without date filter
- Selecting "Last 7 Days" preset → network request includes `dateFrom` + `dateTo` params
- Service type filter still works client-side

- [ ] **Step 6: Commit**

```bash
git add web/stores/useFilterStore.ts web/lib/services/activity.ts web/components/activity/ActivityFilters.tsx
git commit -m "feat: add dateFrom/dateTo to activity filter store and wire to API"
```

---

### Task 4: Dashboard Download Button

**Files:**
- Create: `web/components/dashboard/DownloadDashboardButton.tsx`
- Modify: `web/app/(dashboard)/dashboard/page.tsx` — add button to header

**Interfaces:**
- Consumes (props):
  ```typescript
  interface Props {
    filter: { vehicleId?: string; dateFrom?: string; dateTo?: string };
  }
  ```
- Produces: `laporan-dashboard-YYYY-MM-DD.xlsx` with 7 sheets

Dashboard service functions used (all exist in `web/lib/services/dashboard.ts`):
- `getStats(filter)` → `{ totalKwh, activityCount, totalKm, avgBatteryPct }`
- `getTopEnergy(filter)` → `{ vehicleId, vehicleName, totalKwh, pct }[]`
- `getAvgKwhPerVehicle(filter)` → `{ vehicleId, vehicleName, avgKwh, estimatedCost, sessionCount }[]`
- `getBatteryHourly(filter)` → `{ vehicles: string[], data: { hour: number, [vName]: number }[] }`

Sheet definitions:

| # | Sheet Name | Data Source | Columns |
|---|-----------|-------------|---------|
| 1 | Ringkasan | getStats() + computed | Metrik, Nilai |
| 2 | Rata-rata kWh | getAvgKwhPerVehicle() | Kendaraan, Rata-rata kWh, Jumlah Sesi |
| 3 | Estimasi Biaya | getAvgKwhPerVehicle() | Kendaraan, Estimasi Biaya (Rp), Rata-rata kWh, Jumlah Sesi |
| 4 | Energi Tertinggi | getTopEnergy() | Kendaraan, Total kWh, Persentase (%) |
| 5 | Konsumsi per Jam | getBatteryHourly() | Jam, [vehicleName col per vehicle] |
| 6 | Waktu Penggunaan | getActivityLogs() computed | Kendaraan, Total Menit, Total Jam |
| 7 | Aktivitas Terakhir | getActivityLogs() | Tanggal & Waktu, Kendaraan, Unit ID, Tipe Aktivitas, Pengemudi, Status, Energi (kWh), Durasi (menit) |

- [ ] **Step 1: Read `web/lib/services/dashboard.ts`**

Confirm exact function names, parameter shape, and return types before writing the component.

- [ ] **Step 2: Read `web/app/(dashboard)/dashboard/page.tsx`**

Find how `dashboardFilter` is stored in state (variable name, shape) and where the header title row is so you know exactly where to insert the button.

- [ ] **Step 3: Create `web/components/dashboard/DownloadDashboardButton.tsx`**

```typescript
"use client";
import { useState } from "react";
import * as XLSX from "xlsx";
import { defaultDateRange, buildRows, sheetFromRows, downloadWorkbook } from "@/lib/excel";
import { getStats, getTopEnergy, getAvgKwhPerVehicle, getBatteryHourly } from "@/lib/services/dashboard";
import { getActivityLogs } from "@/lib/services/activity";
import { format } from "date-fns";

interface Props {
  filter: { vehicleId?: string; dateFrom?: string; dateTo?: string };
}

export function DownloadDashboardButton({ filter }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const dates =
        filter.dateFrom && filter.dateTo
          ? { dateFrom: filter.dateFrom, dateTo: filter.dateTo }
          : defaultDateRange();

      const fullFilter = { vehicleId: filter.vehicleId, ...dates };

      const [stats, topEnergy, avgKwh, batteryHourly, logs] = await Promise.all([
        getStats(fullFilter),
        getTopEnergy(fullFilter),
        getAvgKwhPerVehicle(fullFilter),
        getBatteryHourly(fullFilter),
        getActivityLogs({
          serviceType: "all",
          vehicleId: filter.vehicleId ?? "all",
          dateFrom: dates.dateFrom,
          dateTo: dates.dateTo,
        }),
      ]);

      const wb = XLSX.utils.book_new();

      // Sheet 1: Ringkasan
      const totalDurationMin = logs.reduce((s, l) => s + (l.durationMinutes ?? 0), 0);
      const statsRows: (string | number)[][] = [
        ["Metrik", "Nilai"],
        ["Total Energi (kWh)", stats.totalKwh ?? 0],
        ["Total Aktivitas", stats.activityCount ?? 0],
        ["Total Waktu Penggunaan (menit)", Math.round(totalDurationMin)],
        ["Total Waktu Penggunaan (jam)", Math.round((totalDurationMin / 60) * 10) / 10],
        ["Periode", `${format(new Date(dates.dateFrom), "dd/MM/yyyy")} – ${format(new Date(dates.dateTo), "dd/MM/yyyy")}`],
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(statsRows), "Ringkasan");

      // Sheet 2: Rata-rata kWh
      XLSX.utils.book_append_sheet(
        wb,
        sheetFromRows(
          buildRows(avgKwh as Record<string, unknown>[], [
            { key: "vehicleName", label: "Kendaraan" },
            { key: "avgKwh", label: "Rata-rata kWh" },
            { key: "sessionCount", label: "Jumlah Sesi" },
          ])
        ),
        "Rata-rata kWh"
      );

      // Sheet 3: Estimasi Biaya
      XLSX.utils.book_append_sheet(
        wb,
        sheetFromRows(
          buildRows(avgKwh as Record<string, unknown>[], [
            { key: "vehicleName", label: "Kendaraan" },
            { key: "estimatedCost", label: "Estimasi Biaya (Rp)" },
            { key: "avgKwh", label: "Rata-rata kWh" },
            { key: "sessionCount", label: "Jumlah Sesi" },
          ])
        ),
        "Estimasi Biaya"
      );

      // Sheet 4: Energi Tertinggi
      XLSX.utils.book_append_sheet(
        wb,
        sheetFromRows(
          buildRows(topEnergy as Record<string, unknown>[], [
            { key: "vehicleName", label: "Kendaraan" },
            { key: "totalKwh", label: "Total kWh" },
            { key: "pct", label: "Persentase (%)" },
          ])
        ),
        "Energi Tertinggi"
      );

      // Sheet 5: Konsumsi per Jam
      const hourlyHeader: (string | number)[] = [
        "Jam",
        ...batteryHourly.vehicles,
      ];
      const hourlyRows: (string | number)[][] = batteryHourly.data.map(
        (row: Record<string, unknown>) => [
          `${String(row.hour).padStart(2, "0")}:00`,
          ...batteryHourly.vehicles.map((v: string) => (row[v] as number) ?? 0),
        ]
      );
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.aoa_to_sheet([hourlyHeader, ...hourlyRows]),
        "Konsumsi per Jam"
      );

      // Sheet 6: Waktu Penggunaan (computed from logs)
      const usageMap: Record<string, number> = {};
      for (const l of logs) {
        if (!usageMap[l.vehicleName]) usageMap[l.vehicleName] = 0;
        usageMap[l.vehicleName] += l.durationMinutes ?? 0;
      }
      const usageData = Object.entries(usageMap).map(([vehicleName, totalMenit]) => ({
        vehicleName,
        totalMenit: Math.round(totalMenit),
        totalJam: Math.round((totalMenit / 60) * 10) / 10,
      }));
      XLSX.utils.book_append_sheet(
        wb,
        sheetFromRows(
          buildRows(usageData as Record<string, unknown>[], [
            { key: "vehicleName", label: "Kendaraan" },
            { key: "totalMenit", label: "Total Menit" },
            { key: "totalJam", label: "Total Jam" },
          ])
        ),
        "Waktu Penggunaan"
      );

      // Sheet 7: Aktivitas Terakhir (all logs, sorted by date desc — already sorted from BE)
      XLSX.utils.book_append_sheet(
        wb,
        sheetFromRows(
          buildRows(logs as Record<string, unknown>[], [
            { key: "dateTime", label: "Tanggal & Waktu" },
            { key: "vehicleName", label: "Kendaraan" },
            { key: "unitId", label: "Unit ID" },
            { key: "serviceType", label: "Tipe Aktivitas" },
            { key: "driver", label: "Pengemudi" },
            { key: "status", label: "Status" },
            { key: "energyKwh", label: "Energi (kWh)" },
            { key: "durationMinutes", label: "Durasi (menit)" },
          ])
        ),
        "Aktivitas Terakhir"
      );

      const dateStr = format(new Date(), "yyyy-MM-dd");
      downloadWorkbook(wb, `laporan-dashboard-${dateStr}.xlsx`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      style={{
        background: "#00714D",
        border: "none",
        borderRadius: 10,
        color: "#fff",
        fontSize: 11,
        fontWeight: 600,
        padding: "9px 14px",
        fontFamily: "inherit",
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.7 : 1,
        display: "flex",
        alignItems: "center",
        gap: 6,
        flexShrink: 0,
      }}
    >
      {loading ? "Mengunduh..." : "↓ Unduh Laporan"}
    </button>
  );
}
```

- [ ] **Step 4: Add button to dashboard page header**

In `web/app/(dashboard)/dashboard/page.tsx`, import `DownloadDashboardButton`. Find the header `<div className="flex items-start justify-between gap-3">` row and add the button alongside or after the title block. Pass the current `dashboardFilter` (or equivalent state variable) as the `filter` prop:

```tsx
import { DownloadDashboardButton } from "@/components/dashboard/DownloadDashboardButton";

// In the header row, add:
<DownloadDashboardButton filter={dashboardFilter} />
```

If `dashboardFilter` is named differently (e.g., `filter`, `activeFilter`), use the actual variable name from the page state.

- [ ] **Step 5: Verify download**

Run dev server. Open `/dashboard`:
- Click "↓ Unduh Laporan" with no date filter → downloads file named `laporan-dashboard-YYYY-MM-DD.xlsx`
- Open file → confirm 7 sheets: Ringkasan, Rata-rata kWh, Estimasi Biaya, Energi Tertinggi, Konsumsi per Jam, Waktu Penggunaan, Aktivitas Terakhir
- Ringkasan sheet → "Periode" row shows 3-month range
- Set a vehicle filter and date range → re-download → data is filtered accordingly
- Loading state shows "Mengunduh..." and button is disabled during fetch

- [ ] **Step 6: Commit**

```bash
git add web/components/dashboard/DownloadDashboardButton.tsx web/app/\(dashboard\)/dashboard/page.tsx
git commit -m "feat: add dashboard Excel export with 7 per-widget sheets"
```

---

### Task 5: Activity Log Download Button

**Files:**
- Create: `web/components/activity/DownloadActivityButton.tsx`
- Modify: `web/app/(dashboard)/activity/page.tsx` — add button to header

**Interfaces:**
- Consumes (props):
  ```typescript
  interface Props {
    filter: { vehicleId: string; serviceType: string; dateFrom?: string; dateTo?: string };
  }
  ```
- Produces: `log-aktivitas-YYYY-MM-DD.xlsx` with 1 sheet "Log Aktivitas"

Sheet columns: Tanggal & Waktu, Kendaraan, Unit ID, Tipe Aktivitas, Pengemudi, Status, Energi (kWh), Durasi (menit), Dibuat Oleh

- [ ] **Step 1: Create `web/components/activity/DownloadActivityButton.tsx`**

```typescript
"use client";
import { useState } from "react";
import * as XLSX from "xlsx";
import { defaultDateRange, buildRows, sheetFromRows, downloadWorkbook } from "@/lib/excel";
import { getActivityLogs } from "@/lib/services/activity";
import { format } from "date-fns";

interface Props {
  filter: { vehicleId: string; serviceType: string; dateFrom?: string; dateTo?: string };
}

export function DownloadActivityButton({ filter }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const dates =
        filter.dateFrom && filter.dateTo
          ? { dateFrom: filter.dateFrom, dateTo: filter.dateTo }
          : defaultDateRange();

      const logs = await getActivityLogs({ ...filter, ...dates });

      const rows = buildRows(logs as Record<string, unknown>[], [
        { key: "dateTime", label: "Tanggal & Waktu" },
        { key: "vehicleName", label: "Kendaraan" },
        { key: "unitId", label: "Unit ID" },
        { key: "serviceType", label: "Tipe Aktivitas" },
        { key: "driver", label: "Pengemudi" },
        { key: "status", label: "Status" },
        { key: "energyKwh", label: "Energi (kWh)" },
        { key: "durationMinutes", label: "Durasi (menit)" },
        { key: "createdBy", label: "Dibuat Oleh" },
      ]);

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, sheetFromRows(rows), "Log Aktivitas");

      const dateStr = format(new Date(), "yyyy-MM-dd");
      downloadWorkbook(wb, `log-aktivitas-${dateStr}.xlsx`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      style={{
        background: "#00714D",
        border: "none",
        borderRadius: 10,
        color: "#fff",
        fontSize: 11,
        fontWeight: 600,
        padding: "9px 14px",
        fontFamily: "inherit",
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.7 : 1,
        display: "flex",
        alignItems: "center",
        gap: 6,
        flexShrink: 0,
      }}
    >
      {loading ? "Mengunduh..." : "↓ Unduh Log"}
    </button>
  );
}
```

- [ ] **Step 2: Read `web/app/(dashboard)/activity/page.tsx`**

Confirm the variable name for `activityFilter` from `useFilterStore()` in the page, and find the exact header JSX to know where to insert the button.

- [ ] **Step 3: Add button to activity page header**

In `web/app/(dashboard)/activity/page.tsx`, import `DownloadActivityButton`. Wrap the header's right side in a flex row to place both the download button and the "Input Aktivitas" button side by side:

```tsx
import { DownloadActivityButton } from "@/components/activity/DownloadActivityButton";

// Replace the existing right-side of the header:
<div className="flex items-center gap-2 flex-shrink-0">
  <DownloadActivityButton filter={activityFilter} />
  {perms.canWriteActivity && (
    <button
      onClick={handleAdd}
      className="flex items-center gap-1.5"
      style={{ background: "#DA0037", border: "none", borderRadius: 10, color: "#fff", fontSize: 11, fontWeight: 600, padding: "9px 14px", fontFamily: "inherit", cursor: "pointer" }}
    >
      <span style={{ fontSize: 14, lineHeight: 1 }}>+</span>
      Input Aktivitas
    </button>
  )}
</div>
```

`activityFilter` from `useFilterStore()` now includes `dateFrom`/`dateTo` from Task 3.

- [ ] **Step 4: Verify download**

Run dev server. Open `/activity`:
- "↓ Unduh Log" always visible (no permission gate)
- Click without filter → downloads `log-aktivitas-YYYY-MM-DD.xlsx` with ~3 months of data
- Apply "Last 7 Days" date preset → click download → verify only 7 days in file
- Filter by serviceType "Charging" → download → verify only Charging rows
- Filter by vehicle → download → verify only that vehicle's rows
- Verify 9 columns in sheet: Tanggal & Waktu, Kendaraan, Unit ID, Tipe Aktivitas, Pengemudi, Status, Energi (kWh), Durasi (menit), Dibuat Oleh
- Loading state works (button disabled, text changes)

- [ ] **Step 5: Commit**

```bash
git add web/components/activity/DownloadActivityButton.tsx web/app/\(dashboard\)/activity/page.tsx
git commit -m "feat: add activity log Excel export with filter support"
```

---

## Self-Review

**Spec coverage:**
- [x] Dashboard download → Task 4 (7 sheets per widget)
- [x] Activity download → Task 5 (1 sheet, all columns)
- [x] 3-month default → `defaultDateRange()` in Task 1, used in Tasks 4 and 5
- [x] Filter-aware → filter passed as props from page state; date wired to store in Task 3
- [x] Excel format → `xlsx` library, `.xlsx` output
- [x] BE date filter → Task 2 adds `dateFrom`/`dateTo` to `/activities`

**Placeholder scan:** No TBD, TODO, or "similar to" references. All code blocks complete.

**Type consistency:**
- `defaultDateRange` → returns `{ dateFrom: string; dateTo: string }` — used identically in Tasks 4 and 5
- `buildRows` → accepts `Record<string, unknown>[]` and `ColDef[]` — matches all call sites
- `getActivityLogs(filter: ActivityFilter)` → `ActivityFilter` updated in Task 3 to include date fields; all callers (Task 4, 5) pass `dateFrom`/`dateTo`
- `batteryHourly.vehicles` typed as `string[]`; `batteryHourly.data` as `Record<string, unknown>[]` — consistent across Task 4

**No gaps found.**
