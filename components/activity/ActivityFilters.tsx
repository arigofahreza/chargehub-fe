"use client";
import { useMemo, useState } from "react";
import { endOfDay, startOfDay, subDays, subMonths, subWeeks } from "date-fns";
import { useFilterStore } from "@/stores/useFilterStore";
import { Calendar, RangeValue } from "@/components/ui/calendar-range";
import { SelectDropdown } from "@/components/ui/select-dropdown";

const SERVICE_TYPES = ["all", "Charging", "Maintenance", "Inspection", "Tire Rotation", "Battery Check"];

const selectStyle: React.CSSProperties = {
  height: 38,
  borderRadius: 8,
  background: "#EDEDED",
  border: "1px solid rgba(195,198,215,0.3)",
  padding: "0 10px",
  fontSize: 13,
  fontFamily: "inherit",
  color: "#171717",
  outline: "none",
};

interface Props {
  vehicleOptions: { id: string; name: string }[];
}

export function ActivityFilters({ vehicleOptions }: Props) {
  const { activityFilter, setActivityFilter, clearActivityFilters } = useFilterStore();
  const [dateRange, setDateRange] = useState<RangeValue | null>(null);
  const hasFilter =
    activityFilter.serviceType !== "all" ||
    activityFilter.vehicleId !== "all" ||
    dateRange !== null;

  const presets = useMemo(() => {
    const now = new Date();
    return {
      "today": { text: "Today", start: startOfDay(now), end: endOfDay(now) },
      "last-7-days": { text: "Last 7 Days", start: startOfDay(subDays(now, 7)), end: endOfDay(now) },
      "last-30-days": { text: "Last 30 Days", start: startOfDay(subDays(now, 30)), end: endOfDay(now) },
      "last-2-weeks": { text: "Last 2 Weeks", start: startOfDay(subWeeks(now, 2)), end: endOfDay(now) },
      "last-month": { text: "Last Month", start: startOfDay(subMonths(now, 1)), end: endOfDay(now) },
      "last-3-months": { text: "Last 3 Months", start: startOfDay(subMonths(now, 3)), end: endOfDay(now) },
    };
  }, []);

  const handleClearAll = () => {
    clearActivityFilters();
    setDateRange(null);
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "#fff",
        border: "1px solid rgba(195,198,215,0.3)",
        borderRadius: 14,
        padding: 12,
        flexWrap: "wrap",
      }}
    >
      {/* Date range calendar picker */}
      <Calendar
        value={dateRange}
        onChange={setDateRange}
        presets={presets}
        showTimeInput={false}
        showTimezone={false}
      />

      {/* Service type */}
      <SelectDropdown
        value={activityFilter.serviceType ?? "all"}
        onChange={(val) => setActivityFilter({ serviceType: val })}
        options={SERVICE_TYPES.map((s) => ({ value: s, label: `Service: ${s === "all" ? "All" : s}` }))}
        style={selectStyle}
      />

      {/* Vehicle */}
      <SelectDropdown
        value={activityFilter.vehicleId ?? "all"}
        onChange={(val) => setActivityFilter({ vehicleId: val })}
        options={[
          { value: "all", label: "Vehicle: All" },
          ...vehicleOptions.map((v) => ({ value: v.id, label: `Vehicle: ${v.name}` })),
        ]}
        style={selectStyle}
      />

      {/* Clear */}
      {hasFilter && (
        <button
          onClick={handleClearAll}
          style={{
            background: "none",
            border: "none",
            color: "#DA0037",
            fontWeight: 700,
            fontSize: 13,
            fontFamily: "inherit",
            cursor: "pointer",
          }}
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}
