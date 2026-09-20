"use client";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { SelectDropdown } from "@/components/ui/select-dropdown";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { ActivityLog, ActivityStatus } from "@/lib/types";
import { sheetVariants, sheetOverlayVariants } from "@/lib/motion";
import { X } from "lucide-react";
import { ServiceTypePicker } from "@/components/ui/service-type-picker";
import { MultiSelectDropdown } from "@/components/ui/multi-select-dropdown";
import { getBatteryState, calibrateBatteryState } from "@/lib/services/activity";
import { getBatteryDrainRates, BatteryDrainRate } from "@/lib/services/management";
import { usePermissions } from "@/hooks/usePermissions";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Partial<ActivityLog>;
  onSubmit: (data: Partial<ActivityLog>) => Promise<void>;
  mode: "add" | "edit";
  vehicleOptions: { id: string; name: string; unitId: string; batteryPercent?: number; batteryCapacityKwh?: number; degradationRatePct?: number; vehicleType?: string }[];
  supervisorOptions: { value: string; label: string }[];
  driverOptions: { value: string; label: string; jobTitle: string }[];
}

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 500,
  color: "#444444",
};

const inputStyle: React.CSSProperties = {
  height: 46,
  borderRadius: 8,
  background: "#fff",
  border: "1px solid rgba(195,198,215,0.5)",
  padding: "0 12px",
  fontSize: 14,
  fontFamily: "inherit",
  color: "#171717",
  outline: "none",
  width: "100%",
};

const EKSKAVATOR_SERVICES = ["Loading", "Charging"];
const CHARGING_RATE_PER_MIN = 1.2;

const VEHICLE_TYPE_DRIVER_JOB_TITLE: Record<string, string> = {
  "wheel loader": "Operator Wheel Loader",
  "ekskavator": "Operator Ekskavator",
};

function getAllowedServices(vehicleType?: string): string[] | null {
  if (vehicleType?.toLowerCase() === "ekskavator") return EKSKAVATOR_SERVICES;
  return null;
}

function toLocalISOString(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function computeHourlyEstimation(
  startBattery: number,
  ratePerMin: number,
  isIncreasing: boolean
): { hour: number; pct: number }[] {
  const out: { hour: number; pct: number }[] = [];
  for (let h = 1; h <= 12; h++) {
    const pct = isIncreasing
      ? Math.round(Math.min(100, startBattery + h * 60 * ratePerMin) * 10) / 10
      : Math.round(Math.max(0, startBattery - h * 60 * ratePerMin) * 10) / 10;
    out.push({ hour: h, pct });
    if (isIncreasing && pct >= 100) break;
    if (!isIncreasing && pct <= 30) break;
  }
  return out;
}

function formatDuration(minutes: number): string {
  if (minutes <= 0) return "< 1m";
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}j`;
  return `${h}j ${m}m`;
}

export function ActivityFormModal({ open, onOpenChange, initial, onSubmit, mode, vehicleOptions, supervisorOptions, driverOptions }: Props) {
  const [isMobile, setIsMobile] = useState(false);
  const [form, setForm] = useState<Partial<ActivityLog>>(
    initial ?? {
      dateTime: new Date().toISOString().slice(0, 16),
      vehicleId: "",
      vehicleName: "",
      unitId: "",
      serviceType: "Charging",
      supervisors: [],
      driver: "",
      status: "pending",
      createdBy: "Admin",
    }
  );
  const [saving, setSaving] = useState(false);
  const [batteryState, setBatteryState] = useState<{ batteryPct: number; calculatedAt: string | null } | null>(null);
  const [batteryEdit, setBatteryEdit] = useState<string>("");
  const [batteryEditing, setBatteryEditing] = useState(false);
  const [batterySaving, setBatterySaving] = useState(false);
  const [drainRates, setDrainRates] = useState<BatteryDrainRate[]>([]);
  const [loadingDrainRates, setLoadingDrainRates] = useState(false);
  const perms = usePermissions();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setBatteryState(null);
      setBatteryEdit("");
      setBatteryEditing(false);
      setForm(
        initial ?? {
          dateTime: toLocalISOString(new Date()),
          vehicleId: "",
          vehicleName: "",
          unitId: "",
          serviceType: "Charging",
          supervisors: [],
          driver: "",
          status: "pending",
          createdBy: "Admin",
        }
      );
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (perms.allowedServiceTypes && form.serviceType && !perms.allowedServiceTypes.includes(form.serviceType)) {
      setForm((f) => ({ ...f, serviceType: perms.allowedServiceTypes![0] ?? "Charging" }));
    }
  }, [open, perms.allowedServiceTypes]);

  useEffect(() => {
    if (!open || !form.vehicleId) {
      setBatteryState(null);
      setBatteryEdit("");
      setBatteryEditing(false);
      return;
    }
    getBatteryState(form.vehicleId).then((s) => {
      setBatteryState(s);
      setBatteryEdit(s.batteryPct.toFixed(1));
      setBatteryEditing(false);
    });
  }, [open, form.vehicleId]);

  useEffect(() => {
    if (!open) return;
    setLoadingDrainRates(true);
    getBatteryDrainRates()
      .then(setDrainRates)
      .catch(() => setDrainRates([]))
      .finally(() => setLoadingDrainRates(false));
  }, [open]);

  async function handleBatterySave() {
    if (!form.vehicleId) return;
    const val = parseFloat(batteryEdit);
    if (isNaN(val) || val < 0 || val > 100) return;
    setBatterySaving(true);
    try {
      const updated = await calibrateBatteryState(form.vehicleId, val);
      setBatteryState(updated);
      setBatteryEditing(false);
    } finally {
      setBatterySaving(false);
    }
  }

  function handleVehicleChange(vehicleId: string) {
    const v = vehicleOptions.find((o) => o.id === vehicleId);
    const allowed = getAllowedServices(v?.vehicleType);
    const requiredJobTitle = v?.vehicleType ? VEHICLE_TYPE_DRIVER_JOB_TITLE[v.vehicleType.toLowerCase()] : undefined;
    setForm((f) => {
      const driverStillValid = !requiredJobTitle ||
        driverOptions.some((d) => d.value === f.driver && d.jobTitle === requiredJobTitle);
      return {
        ...f,
        vehicleId,
        vehicleName: v?.name ?? "",
        unitId: v?.unitId ?? "",
        serviceType: f.serviceType && allowed && allowed.includes(f.serviceType) ? f.serviceType : allowed ? allowed[0] : f.serviceType,
        driver: driverStillValid ? f.driver : "",
      };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        dateTime: form.dateTime ? new Date(form.dateTime).toISOString() : new Date().toISOString(),
      };
      await onSubmit(payload);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  const title = mode === "add" ? "Buat Log" : "Edit Log";
  const canSubmit = !!form.vehicleId && (form.supervisors?.length ?? 0) > 0 && !!form.driver;
  const selectedVehicle = vehicleOptions.find((v) => v.id === form.vehicleId);
  const vehicleAllowedServices = getAllowedServices(selectedVehicle?.vehicleType);
  const requiredDriverJobTitle = selectedVehicle?.vehicleType
    ? VEHICLE_TYPE_DRIVER_JOB_TITLE[selectedVehicle.vehicleType.toLowerCase()]
    : undefined;
  const filteredDriverOptions = requiredDriverJobTitle
    ? driverOptions.filter((d) => d.jobTitle.toLowerCase() === requiredDriverJobTitle.toLowerCase())
    : driverOptions;
  const allowedServices: string[] | undefined =
    perms.allowedServiceTypes && vehicleAllowedServices
      ? vehicleAllowedServices.filter((s) => perms.allowedServiceTypes!.includes(s))
      : perms.allowedServiceTypes
      ? perms.allowedServiceTypes
      : vehicleAllowedServices ?? undefined;

  // Derived values for battery estimation & recommendations
  const isCharging = form.serviceType === "Charging";
  const currentBattery = batteryState?.batteryPct ?? 100;
  const selectedDrainRate = !isCharging
    ? drainRates.find((r) => r.activityName === form.serviceType)
    : undefined;
  const isIncreasing = isCharging || selectedDrainRate?.category === "kenaikan";
  const estimationRate = isCharging ? CHARGING_RATE_PER_MIN : (selectedDrainRate?.persenPenurunan ?? 0);
  const hourlyEstimation =
    form.vehicleId && batteryState && (isCharging || selectedDrainRate)
      ? computeHourlyEstimation(currentBattery, estimationRate, isIncreasing)
      : [];
  const activityRecs = form.vehicleId
    ? drainRates
        .filter((r) => r.category === "penurunan" && r.persenPenurunan > 0)
        .map((r) => ({
          ...r,
          minutesToThreshold: currentBattery > 30 ? (currentBattery - 30) / r.persenPenurunan : 0,
        }))
        .sort((a, b) => b.minutesToThreshold - a.minutesToThreshold)
    : [];

  const serviceChips = (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={labelStyle}>Tipe Aktivitas</label>
      <div style={{ overflowX: "auto", paddingBottom: 2 }}>
        <ServiceTypePicker
          value={form.serviceType ?? ""}
          onChange={(v) => setForm((f) => ({ ...f, serviceType: v }))}
          allowedValues={allowedServices}
        />
      </div>
    </div>
  );

  const chargingMinsToFull = isCharging && batteryState ? Math.max(0, (100 - currentBattery) / CHARGING_RATE_PER_MIN) : null;
  const drainMinsToThreshold = !isCharging && selectedDrainRate && batteryState && currentBattery > 30
    ? (currentBattery - 30) / selectedDrainRate.persenPenurunan
    : null;

  const batteryEstimationSection = (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <span style={{ fontSize: 15, fontWeight: 600, color: "#171717" }}>Estimasi Baterai</span>

      {!form.vehicleId && (
        <div style={{ borderRadius: 10, background: "#EDEDED", border: "1px solid rgba(195,198,215,0.5)", padding: "10px 14px", fontSize: 12, color: "#777777" }}>
          Pilih kendaraan untuk melihat estimasi baterai.
        </div>
      )}

      {form.vehicleId && !batteryState && (
        <div style={{ borderRadius: 10, background: "#EDEDED", border: "1px solid rgba(195,198,215,0.5)", padding: "10px 14px", fontSize: 12, color: "#777777" }}>
          Memuat kondisi baterai...
        </div>
      )}

      {/* Non-charging: no drain rate */}
      {form.vehicleId && batteryState && !isCharging && !selectedDrainRate && (
        <div style={{ borderRadius: 10, background: "#FFF7ED", border: "1px solid rgba(234,179,8,0.3)", padding: "10px 14px", fontSize: 12, color: "#92400E" }}>
          Drain rate belum diatur untuk aktivitas ini. Atur di menu <strong>Manajemen → Pengaturan Baterai</strong>.
        </div>
      )}

      {/* Charging: already full */}
      {form.vehicleId && batteryState && isCharging && currentBattery >= 100 && (
        <div style={{ borderRadius: 10, background: "rgba(0,113,77,0.07)", border: "1px solid rgba(0,113,77,0.2)", padding: "10px 14px", fontSize: 12, color: "#00714D", fontWeight: 500 }}>
          Baterai sudah penuh (100%).
        </div>
      )}

      {/* Non-charging: already at/below threshold */}
      {form.vehicleId && batteryState && !isCharging && selectedDrainRate && currentBattery <= 30 && (
        <div style={{ borderRadius: 10, background: "rgba(186,26,26,0.06)", border: "1px solid rgba(186,26,26,0.2)", padding: "10px 14px", fontSize: 12, color: "#BA1A1A", fontWeight: 500 }}>
          Baterai sudah di threshold 30% — perlu charging segera.
        </div>
      )}

      {/* Summary line */}
      {form.vehicleId && batteryState && isCharging && chargingMinsToFull !== null && currentBattery < 100 && (
        <div style={{ borderRadius: 10, background: "rgba(0,113,77,0.07)", border: "1px solid rgba(0,113,77,0.15)", padding: "8px 14px", fontSize: 12, color: "#00714D", fontWeight: 500 }}>
          Estimasi penuh: <strong>{formatDuration(chargingMinsToFull)}</strong>
        </div>
      )}
      {form.vehicleId && batteryState && !isCharging && drainMinsToThreshold !== null && (
        <div style={{ borderRadius: 10, background: "rgba(180,83,9,0.07)", border: "1px solid rgba(180,83,9,0.15)", padding: "8px 14px", fontSize: 12, color: "#B45309", fontWeight: 500 }}>
          Estimasi ke threshold 30%: <strong>{formatDuration(drainMinsToThreshold)}</strong>
        </div>
      )}

      {/* Per-hour table */}
      {form.vehicleId && batteryState && hourlyEstimation.length > 0 && !(isCharging && currentBattery >= 100) && !(! isCharging && currentBattery <= 30) && (
        <div style={{ borderRadius: 10, background: "#EDEDED", border: "1px solid rgba(195,198,215,0.5)", overflow: "hidden" }}>
          <div style={{ padding: "8px 14px", borderBottom: "1px solid rgba(195,198,215,0.3)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff" }}>
            <span style={{ fontSize: 11, color: "#777", fontWeight: 500 }}>Sekarang</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: currentBattery >= 50 ? "#00714D" : currentBattery >= 30 ? "#B45309" : "#BA1A1A" }}>
              {currentBattery.toFixed(1)}%
            </span>
          </div>
          {hourlyEstimation.map(({ hour, pct }) => {
            const color = isIncreasing
              ? (pct >= 80 ? "#00714D" : pct >= 50 ? "#2563EB" : "#B45309")
              : (pct >= 50 ? "#00714D" : pct >= 30 ? "#B45309" : "#BA1A1A");
            const atThreshold = !isIncreasing && pct <= 30;
            const atFull = isIncreasing && pct >= 100;
            return (
              <div
                key={hour}
                style={{
                  padding: "8px 14px",
                  borderBottom: "1px solid rgba(195,198,215,0.3)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: atThreshold ? "rgba(186,26,26,0.04)" : atFull ? "rgba(0,113,77,0.04)" : undefined,
                }}
              >
                <span style={{ fontSize: 11, color: "#777", fontWeight: 500 }}>Jam ke-{hour}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {atThreshold && (
                    <span style={{ fontSize: 9, background: "#BA1A1A", color: "#fff", borderRadius: 4, padding: "1px 5px", fontWeight: 600 }}>
                      PERLU CHARGING
                    </span>
                  )}
                  {atFull && (
                    <span style={{ fontSize: 9, background: "#00714D", color: "#fff", borderRadius: 4, padding: "1px 5px", fontWeight: 600 }}>
                      PENUH
                    </span>
                  )}
                  <span style={{ fontSize: 13, fontWeight: 700, color }}>{pct.toFixed(1)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const recommendationPanel = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 0,
        background: "#EDEDED",
        border: "1px solid rgba(195,198,215,0.5)",
        borderRadius: 14,
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <div style={{ padding: "14px 16px 12px", borderBottom: "1px solid rgba(195,198,215,0.4)", background: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(218,0,55,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#DA0037" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
            </svg>
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#171717", margin: 0 }}>Estimasi Aktivitas</p>
            <p style={{ fontSize: 10, color: "#777777", margin: 0 }}>Estimasi waktu hingga baterai 30%</p>
          </div>
        </div>
      </div>

      <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8, minHeight: 180 }}>
        {!form.vehicleId && !loadingDrainRates && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 6, paddingTop: 24 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#DEDEDE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            <p style={{ fontSize: 12, color: "#9CA3AF", textAlign: "center", margin: 0 }}>
              Pilih kendaraan untuk melihat estimasi
            </p>
          </div>
        )}

        {loadingDrainRates && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ height: 52, borderRadius: 10, background: "linear-gradient(90deg, #E8ECF4 25%, #F0F3FA 50%, #E8ECF4 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
            ))}
            <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
          </div>
        )}

        {form.vehicleId && !loadingDrainRates && activityRecs.length === 0 && (
          <p style={{ fontSize: 12, color: "#9CA3AF", textAlign: "center", paddingTop: 20 }}>
            Belum ada pengaturan drain rate. Atur di menu Manajemen.
          </p>
        )}

        {form.vehicleId && !loadingDrainRates && activityRecs.map((rec) => {
          const time = formatDuration(rec.minutesToThreshold);
          const color = rec.minutesToThreshold >= 120 ? "#00714D" : rec.minutesToThreshold >= 60 ? "#B45309" : "#BA1A1A";
          const bg = rec.minutesToThreshold >= 120 ? "rgba(0,113,77,0.07)" : rec.minutesToThreshold >= 60 ? "rgba(180,83,9,0.07)" : "rgba(186,26,26,0.07)";
          const border = rec.minutesToThreshold >= 120 ? "rgba(0,113,77,0.15)" : rec.minutesToThreshold >= 60 ? "rgba(180,83,9,0.15)" : "rgba(186,26,26,0.15)";
          return (
            <div
              key={rec.id}
              style={{
                background: "#fff",
                border: `1px solid ${border}`,
                borderRadius: 10,
                padding: "10px 12px",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div style={{ width: 26, height: 26, borderRadius: 7, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#171717", margin: 0 }}>{rec.activityName}</p>
                <p style={{ fontSize: 10, color: "#777", margin: "2px 0 0" }}>hingga baterai 30%</p>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color, flexShrink: 0 }}>{time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  const batteryColor = batteryState
    ? batteryState.batteryPct >= 50 ? "#00714D" : batteryState.batteryPct >= 25 ? "#B45309" : "#BA1A1A"
    : "#9CA3AF";

  const batteryWidget = (
    <div
      style={{
        background: "#fff",
        border: "1px solid rgba(195,198,215,0.5)",
        borderRadius: 14,
        overflow: "hidden",
        flexShrink: 0,
        marginTop: 8,
      }}
    >
      <div style={{ padding: "12px 16px 10px", borderBottom: "1px solid rgba(195,198,215,0.35)", background: "#FAFAFA" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(218,0,55,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#DA0037" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="18" height="11" rx="2" />
              <path d="M22 11v3" />
            </svg>
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#171717", margin: 0 }}>Kondisi Baterai Terkini</p>
            <p style={{ fontSize: 10, color: "#777777", margin: 0 }}>Berdasarkan aktivitas terakhir · bisa dikalibrasi</p>
          </div>
        </div>
      </div>
      <div style={{ padding: "12px 16px" }}>
        {!form.vehicleId ? (
          <p style={{ fontSize: 12, color: "#9CA3AF", margin: 0 }}>Pilih kendaraan untuk melihat kondisi baterai</p>
        ) : batteryEditing ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="number"
              min={0}
              max={100}
              step={0.1}
              autoFocus
              value={batteryEdit}
              onChange={(e) => setBatteryEdit(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleBatterySave(); if (e.key === "Escape") setBatteryEditing(false); }}
              style={{
                width: 80, height: 34, borderRadius: 8, border: "1px solid #DA0037",
                padding: "0 8px", fontSize: 14, fontFamily: "inherit",
                color: "#171717", outline: "none", fontWeight: 600,
              }}
            />
            <span style={{ fontSize: 13, color: "#555" }}>%</span>
            <button
              onClick={handleBatterySave}
              disabled={batterySaving}
              style={{ height: 34, borderRadius: 8, background: "#DA0037", border: "none", color: "#fff", fontWeight: 600, fontSize: 12, padding: "0 12px", fontFamily: "inherit", cursor: "pointer", opacity: batterySaving ? 0.6 : 1 }}
            >
              {batterySaving ? "..." : "Simpan"}
            </button>
            <button
              onClick={() => { setBatteryEditing(false); setBatteryEdit(batteryState?.batteryPct.toFixed(1) ?? ""); }}
              style={{ height: 34, borderRadius: 8, background: "#EDEDED", border: "none", color: "#555", fontWeight: 500, fontSize: 12, padding: "0 10px", fontFamily: "inherit", cursor: "pointer" }}
            >
              Batal
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 26, fontWeight: 800, color: batteryColor, letterSpacing: "-1px" }}>
                {batteryState?.batteryPct.toFixed(1) ?? "100.0"}%
              </span>
              {batteryState?.calculatedAt && (
                <span style={{ fontSize: 10, color: "#9CA3AF" }}>
                  {new Date(batteryState.calculatedAt).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
            </div>
            <button
              onClick={() => setBatteryEditing(true)}
              style={{ height: 30, borderRadius: 8, background: "#F4F5F7", border: "1px solid #DEDEDE", color: "#555", fontWeight: 500, fontSize: 11, padding: "0 10px", fontFamily: "inherit", cursor: "pointer" }}
            >
              Kalibrasi
            </button>
          </div>
        )}
        {form.vehicleId && batteryState && !batteryEditing && (
          <div style={{ marginTop: 8, height: 5, borderRadius: 9999, background: "rgba(195,198,215,0.3)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.max(0, Math.min(100, batteryState.batteryPct))}%`, borderRadius: 9999, background: batteryColor, transition: "width 0.4s ease" }} />
          </div>
        )}
      </div>
    </div>
  );

  const formBody = (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <label style={labelStyle}>Tanggal &amp; Waktu</label>
        <DateTimePicker
          value={form.dateTime ? new Date(form.dateTime) : null}
          onChange={(date) => setForm((f) => ({ ...f, dateTime: date?.toISOString() ?? "" }))}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <label style={labelStyle}>Penugasan Kendaraan <span style={{ color: "#DA0037" }}>*</span></label>
        <SelectDropdown
          value={form.vehicleId ?? ""}
          onChange={handleVehicleChange}
          options={[
            { value: "", label: "Pilih kendaraan..." },
            ...vehicleOptions.map((v) => ({ value: v.id, label: `${v.name} - ${v.unitId}` })),
          ]}
          style={inputStyle}
        />
      </div>
      {serviceChips}
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <label style={labelStyle}>Pengawas <span style={{ color: "#DA0037" }}>*</span></label>
        <MultiSelectDropdown
          values={form.supervisors ?? []}
          onChange={(vals) => setForm((f) => ({ ...f, supervisors: vals }))}
          options={supervisorOptions}
          placeholder="Pilih pengawas..."
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <label style={labelStyle}>Nama Pengemudi <span style={{ color: "#DA0037" }}>*</span></label>
        <SelectDropdown
          key="mobile-driver"
          value={form.driver ?? ""}
          onChange={(val) => setForm((f) => ({ ...f, driver: val }))}
          options={[{ value: "", label: "Pilih pengemudi..." }, ...filteredDriverOptions]}
          style={inputStyle}
          disabled={!form.vehicleId}
        />
        {!form.vehicleId && (
          <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0 }}>Pilih kendaraan terlebih dahulu</p>
        )}
      </div>
    </div>
  );

  // MOBILE: bottom sheet
  if (isMobile) {
    return (
      <AnimatePresence>
        {open && (
          <motion.div
            key="overlay"
            className="mobile-sheet-overlay"
            variants={sheetOverlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => onOpenChange(false)}
          />
        )}
        {open && (
          <motion.div
            key="sheet"
            className="mobile-sheet"
            variants={sheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="mobile-sheet-handle" />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
              <span style={{ fontWeight: 700, fontSize: 17, color: "#171717" }}>{title}</span>
              <button onClick={() => onOpenChange(false)} style={{ width: 28, height: 28, border: "none", background: "rgba(0,0,0,0.06)", borderRadius: 8, color: "#777777", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={15} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ maxHeight: "56vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
                {formBody}
                <div style={{ height: 1, background: "#E5E7EB" }} />
                {batteryEstimationSection}
                <div style={{ height: 1, background: "#E5E7EB" }} />
                {recommendationPanel}
                {batteryWidget}
              </div>
              <button
                type="submit"
                disabled={saving || !canSubmit}
                style={{ height: 48, borderRadius: 12, background: "#DA0037", border: "none", color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: "inherit", cursor: saving || !canSubmit ? "not-allowed" : "pointer", opacity: saving || !canSubmit ? 0.5 : 1, flexShrink: 0 }}
              >
                {saving ? "Menyimpan..." : mode === "add" ? "Buat Log" : "Simpan Perubahan"}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // DESKTOP: 2-column dialog (form left, advisor right)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        style={{
          maxWidth: 860,
          maxHeight: "90vh",
          borderRadius: 16,
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <span style={{ fontWeight: 700, fontSize: 18, color: "#171717" }}>{title}</span>
          <button
            onClick={() => onOpenChange(false)}
            style={{ width: 28, height: 28, border: "none", background: "rgba(0,0,0,0.06)", borderRadius: 8, color: "#777777", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <X size={15} />
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 20, overflow: "hidden", flex: 1 }}>
          {/* Left: form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16, overflowY: "auto", paddingBottom: 4, paddingRight: 4 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#171717" }}>Informasi Dasar</span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <label style={labelStyle}>Tanggal &amp; Waktu</label>
                  <DateTimePicker
                    value={form.dateTime ? new Date(form.dateTime) : null}
                    onChange={(date) => setForm((f) => ({ ...f, dateTime: date?.toISOString() ?? "" }))}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <label style={labelStyle}>Penugasan Kendaraan <span style={{ color: "#DA0037" }}>*</span></label>
                  <SelectDropdown
                    value={form.vehicleId ?? ""}
                    onChange={handleVehicleChange}
                    options={[
                      { value: "", label: "Pilih kendaraan..." },
                      ...vehicleOptions.map((v) => ({ value: v.id, label: `${v.name} - ${v.unitId}` })),
                    ]}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            <div style={{ height: 1, background: "#E5E7EB" }} />

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#171717" }}>Detail Operasional</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={labelStyle}>Tipe Aktivitas</label>
                <ServiceTypePicker
                  value={form.serviceType ?? ""}
                  onChange={(v) => setForm((f) => ({ ...f, serviceType: v }))}
                  allowedValues={allowedServices}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={labelStyle}>Pengawas <span style={{ color: "#DA0037" }}>*</span></label>
                <MultiSelectDropdown
                  values={form.supervisors ?? []}
                  onChange={(vals) => setForm((f) => ({ ...f, supervisors: vals }))}
                  options={supervisorOptions}
                  placeholder="Pilih pengawas..."
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={labelStyle}>Nama Pengemudi <span style={{ color: "#DA0037" }}>*</span></label>
                <SelectDropdown
                  key="desktop-driver"
                  value={form.driver ?? ""}
                  onChange={(val) => setForm((f) => ({ ...f, driver: val }))}
                  options={[{ value: "", label: "Pilih pengemudi..." }, ...filteredDriverOptions]}
                  style={inputStyle}
                  disabled={!form.vehicleId}
                />
                {!form.vehicleId && (
                  <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0 }}>Pilih kendaraan terlebih dahulu</p>
                )}
              </div>
            </div>

            <div style={{ height: 1, background: "#E5E7EB" }} />

            {batteryEstimationSection}

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                style={{ height: 40, borderRadius: 8, background: "none", border: "none", color: "#DA0037", fontWeight: 500, fontSize: 14, padding: "0 20px", fontFamily: "inherit", cursor: "pointer" }}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving || !canSubmit}
                style={{ height: 40, borderRadius: 8, background: "#DA0037", border: "none", color: "#fff", fontWeight: 500, fontSize: 14, padding: "0 20px", fontFamily: "inherit", boxShadow: "0 1px 2px rgba(0,0,0,0.05)", cursor: saving || !canSubmit ? "not-allowed" : "pointer", opacity: saving || !canSubmit ? 0.5 : 1 }}
              >
                {saving ? "Menyimpan..." : mode === "add" ? "Buat Log" : "Simpan Perubahan"}
              </button>
            </div>
          </form>

          {/* Right: estimation panel + battery widget */}
          <div style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: 0 }}>
            {recommendationPanel}
            {batteryWidget}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
