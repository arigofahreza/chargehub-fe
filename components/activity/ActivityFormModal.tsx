"use client";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { SelectDropdown } from "@/components/ui/select-dropdown";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { ActivityLog, ActivityStatus } from "@/lib/types";
import { sheetVariants, sheetOverlayVariants } from "@/lib/motion";
import { X } from "lucide-react";
import { predictBattery } from "@/lib/services/prediction";
import { ServiceTypePicker } from "@/components/ui/service-type-picker";
import { getAvgDuration } from "@/lib/services/activity";
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

interface Recommendation {
  slug: string;
  label: string;
  predicted_after: number;
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

const ACTIVITY_MAP: Record<string, string> = {
  "Heavy Stacking": "heavy_stacking",
  "Light Stacking": "light_stacking",
  "General Activity": "inspection",
  "Inspection": "inspection",
  "Maintenance Access": "inspection",
  "Loading": "loading",
};

const EKSKAVATOR_SERVICES = ["Loading", "Charging"];

const VEHICLE_TYPE_DRIVER_JOB_TITLE: Record<string, string> = {
  "wheel loader": "Operator Wheel Loader",
  "ekskavator": "Operator Ekskavator",
};

function getAllowedServices(vehicleType?: string): string[] | null {
  if (vehicleType?.toLowerCase() === "ekskavator") return EKSKAVATOR_SERVICES;
  return null;
}

const BASELINE_DEGRADATION = 2.0;

function toLocalISOString(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function deriveShift(dateTimeStr: string): "shift_1" | "shift_2" {
  const d = new Date(dateTimeStr);
  const totalMin = d.getHours() * 60 + d.getMinutes();
  return totalMin >= 410 && totalMin < 1130 ? "shift_1" : "shift_2";
}

function applyDegradation(batteryBefore: number, predictedAfter: number, currentRate: number): number {
  const rawDrain = batteryBefore - predictedAfter;
  const scaledDrain = rawDrain * (currentRate / BASELINE_DEGRADATION);  
  return Math.max(0, Math.min(100, batteryBefore - scaledDrain));
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
      driver: "",
      status: "pending",
      createdBy: "Admin",
    }
  );
  const [saving, setSaving] = useState(false);
  const [lastAvgDuration, setLastAvgDuration] = useState<number | undefined>(undefined);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [predicting, setPredicting] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
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
      setPrediction(null);
      setLastAvgDuration(undefined);
      setRecommendations([]);
      setForm(
        initial ?? {
          dateTime: toLocalISOString(new Date()),
          vehicleId: "",
          vehicleName: "",
          unitId: "",
          serviceType: "Charging",
          supervisor: "",
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
    const activity = ACTIVITY_MAP[form.serviceType ?? ""];
    if (!activity || !form.vehicleId || !form.dateTime) {
      setPrediction(null);
      return;
    }

    const vehicleOption = vehicleOptions.find((v) => v.id === form.vehicleId);
    const batteryBefore = vehicleOption?.batteryPercent ?? 100;
    const degradationRate = vehicleOption?.degradationRatePct ?? BASELINE_DEGRADATION;
    const shift = deriveShift(form.dateTime);

    let cancelled = false;

    async function run() {
      setPredicting(true);
      try {
        const avgDur = await getAvgDuration(form.vehicleId!, form.serviceType!);
        const durationMinutes = avgDur ?? 60;
        if (!cancelled) setLastAvgDuration(avgDur ?? undefined);

        const result = await predictBattery({
          truck_id: form.vehicleId!,
          activity,
          duration_minutes: durationMinutes,
          battery_before_pct: batteryBefore,
          shift,
        });

        if (!cancelled) {
          const adjusted = applyDegradation(batteryBefore, result.predicted_battery_after_pct, degradationRate);
          setPrediction(adjusted);
        }
      } catch {
        if (!cancelled) setPrediction(null);
      } finally {
        if (!cancelled) setPredicting(false);
      }
    }

    const timer = setTimeout(run, 600);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [form.vehicleId, form.serviceType, form.dateTime, vehicleOptions]);

  useEffect(() => {
    const vehicleOption = vehicleOptions.find((v) => v.id === form.vehicleId);
    const batteryBefore = vehicleOption?.batteryPercent;
    if (!form.vehicleId || !batteryBefore || batteryBefore <= 0) {
      setRecommendations([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoadingRecs(true);
      try {
        const avgDur = await getAvgDuration(form.vehicleId!, form.serviceType ?? "");
        const durationMinutes = avgDur ?? 60;
        const shift = form.dateTime ? deriveShift(form.dateTime) : "shift_1";
        const res = await fetch("/api/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            truck_id: form.vehicleId,
            battery_before_pct: batteryBefore,
            duration_minutes: durationMinutes,
            shift,
          }),
        });
        const data = await res.json();
        setRecommendations(data.recommendations ?? []);
      } catch {
        setRecommendations([]);
      } finally {
        setLoadingRecs(false);
      }
    }, 700);
    return () => clearTimeout(timer);
  }, [form.vehicleId, form.serviceType, form.dateTime, vehicleOptions]);

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
      const vehicleOpt = vehicleOptions.find((v) => v.id === form.vehicleId);
      const batteryBefore = vehicleOpt?.batteryPercent;
      const capacity = vehicleOpt?.batteryCapacityKwh;
      const notCharging = form.serviceType !== "Charging";
      let energyKwh: number | undefined = undefined;
      if (notCharging && prediction !== null && batteryBefore !== undefined && capacity) {
        energyKwh = Math.max(0, ((batteryBefore - prediction) / 100) * capacity);
      }
      const payload = {
        ...form,
        dateTime: form.dateTime ? new Date(form.dateTime).toISOString() : new Date().toISOString(),
        durationMinutes: lastAvgDuration,
        energyKwh,
      };
      await onSubmit(payload);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  const title = mode === "add" ? "Buat Log" : "Edit Log";

  const canSubmit = !!form.vehicleId && !!form.supervisor && !!form.driver;

  const selectedVehicle = vehicleOptions.find((v) => v.id === form.vehicleId);
  const vehicleAllowedServices = getAllowedServices(selectedVehicle?.vehicleType);
  const requiredDriverJobTitle = selectedVehicle?.vehicleType
    ? VEHICLE_TYPE_DRIVER_JOB_TITLE[selectedVehicle.vehicleType.toLowerCase()]
    : undefined;
  const filteredDriverOptions = requiredDriverJobTitle
    ? driverOptions.filter((d) => d.jobTitle.toLowerCase() === requiredDriverJobTitle.toLowerCase())
    : driverOptions;
  // null = no restriction (show all from DB), string[] = whitelist
  const allowedServices: string[] | undefined =
    perms.allowedServiceTypes && vehicleAllowedServices
      ? vehicleAllowedServices.filter((s) => perms.allowedServiceTypes!.includes(s))
      : perms.allowedServiceTypes
      ? perms.allowedServiceTypes
      : vehicleAllowedServices ?? undefined;

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

  const isCharging = form.serviceType === "Charging";

  const batteryPredictionSection = (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <span style={{ fontSize: 15, fontWeight: 600, color: "#171717" }}>Prediksi Baterai</span>

      {isCharging && (
        <div style={{ borderRadius: 10, background: "#FFF7ED", border: "1px solid rgba(234,179,8,0.3)", padding: "10px 14px", fontSize: 12, color: "#92400E" }}>
          Prediksi baterai tidak tersedia untuk aktivitas Charging.
        </div>
      )}

      {!isCharging && !form.vehicleId && (
        <div style={{ borderRadius: 10, background: "#EDEDED", border: "1px solid rgba(195,198,215,0.5)", padding: "10px 14px", fontSize: 12, color: "#777777" }}>
          Pilih kendaraan untuk melihat prediksi baterai.
        </div>
      )}

      {!isCharging && form.vehicleId && predicting && (
        <div style={{ borderRadius: 10, background: "#EDEDED", border: "1px solid rgba(195,198,215,0.5)", padding: "12px 16px", fontSize: 13, color: "#777777" }}>
          Menghitung prediksi...
        </div>
      )}

      {!isCharging && form.vehicleId && !predicting && prediction !== null && (
        <div style={{ borderRadius: 10, background: "#EDEDED", border: "1px solid rgba(218,0,55,0.15)", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: "#777777", textTransform: "uppercase", letterSpacing: "0.5px" }}>Prediksi AI</span>
            <span style={{ fontSize: 13, color: "#444444" }}>Estimasi baterai setelah aktivitas</span>
          </div>
          <span style={{ fontSize: 22, fontWeight: 700, color: "#DA0037" }}>{prediction.toFixed(1)}%</span>
        </div>
      )}
    </div>
  );

  const vehicleForRec = vehicleOptions.find((v) => v.id === form.vehicleId);
  const hasRecInputs = !!form.vehicleId && (vehicleForRec?.batteryPercent ?? 0) > 0;

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
      {/* Header */}
      <div style={{ padding: "14px 16px 12px", borderBottom: "1px solid rgba(195,198,215,0.4)", background: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(218,0,55,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#DA0037" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#171717", margin: 0 }}>Penasihat Aktivitas</p>
            <p style={{ fontSize: 10, color: "#777777", margin: 0 }}>Diurutkan AI berdasarkan sisa baterai</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8, minHeight: 180 }}>
        {!hasRecInputs && !loadingRecs && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 6, paddingTop: 24 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#DEDEDE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            <p style={{ fontSize: 12, color: "#9CA3AF", textAlign: "center", margin: 0 }}>
              Pilih kendaraan &amp; isi durasi untuk melihat rekomendasi
            </p>
          </div>
        )}

        {loadingRecs && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ height: 52, borderRadius: 10, background: "linear-gradient(90deg, #E8ECF4 25%, #F0F3FA 50%, #E8ECF4 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
            ))}
            <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
          </div>
        )}

        {!loadingRecs && hasRecInputs && recommendations.length === 0 && (
          <p style={{ fontSize: 12, color: "#9CA3AF", textAlign: "center", paddingTop: 20 }}>
            Gagal memuat rekomendasi. Cek layanan ML.
          </p>
        )}

        {!loadingRecs && recommendations.map((rec, i) => {
          const pct = rec.predicted_after;
          const color = pct >= 40 ? "#00714D" : pct >= 20 ? "#B45309" : "#BA1A1A";
          const bg = pct >= 40 ? "rgba(0,113,77,0.07)" : pct >= 20 ? "rgba(180,83,9,0.07)" : "rgba(186,26,26,0.07)";
          const icon = pct >= 40 ? "" : pct >= 20 ? "!" : "";
          const barWidth = Math.max(0, Math.min(100, pct));
          return (
            <div
              key={rec.slug}
              style={{
                background: "#fff",
                border: `1px solid ${pct >= 40 ? "rgba(0,113,77,0.15)" : pct >= 20 ? "rgba(180,83,9,0.15)" : "rgba(186,26,26,0.15)"}`,
                borderRadius: 10,
                padding: "10px 12px",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div style={{ width: 26, height: 26, borderRadius: 7, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 13, fontWeight: 700, color }}>
                {icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#171717", margin: 0, marginBottom: 4 }}>{rec.label}</p>
                <div style={{ height: 4, borderRadius: 9999, background: "rgba(195,198,215,0.3)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${barWidth}%`, borderRadius: 9999, background: color, transition: "width 0.4s ease" }} />
                </div>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color, flexShrink: 0 }}>{pct.toFixed(1)}%</span>
            </div>
          );
        })}
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
        <SelectDropdown
          key="mobile-supervisor"
          value={form.supervisor ?? ""}
          onChange={(val) => setForm((f) => ({ ...f, supervisor: val }))}
          options={[{ value: "", label: "Pilih pengawas..." }, ...supervisorOptions]}
          style={inputStyle}
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
                {batteryPredictionSection}
                <div style={{ height: 1, background: "#E5E7EB" }} />
                {recommendationPanel}
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
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <span style={{ fontWeight: 700, fontSize: 18, color: "#171717" }}>{title}</span>
          <button
            onClick={() => onOpenChange(false)}
            style={{ width: 28, height: 28, border: "none", background: "rgba(0,0,0,0.06)", borderRadius: 8, color: "#777777", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <X size={15} />
          </button>
        </div>

        {/* 2-column body */}
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
                <SelectDropdown
                  key="desktop-supervisor"
                  value={form.supervisor ?? ""}
                  onChange={(val) => setForm((f) => ({ ...f, supervisor: val }))}
                  options={[{ value: "", label: "Pilih pengawas..." }, ...supervisorOptions]}
                  style={inputStyle}
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

            {batteryPredictionSection}

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

          {/* Right: advisor panel */}
          <div style={{ overflowY: "auto" }}>
            {recommendationPanel}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
