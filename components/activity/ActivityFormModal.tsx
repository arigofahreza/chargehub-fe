"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { SelectDropdown } from "@/components/ui/select-dropdown";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { ActivityLog, ActivityStatus } from "@/lib/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Partial<ActivityLog>;
  onSubmit: (data: Partial<ActivityLog>) => Promise<void>;
  mode: "add" | "edit";
  vehicleOptions: { id: string; name: string; unitId: string }[];
}

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 500,
  color: "#434655",
};

const inputStyle: React.CSSProperties = {
  height: 46,
  borderRadius: 8,
  background: "#fff",
  border: "1px solid rgba(195,198,215,0.5)",
  padding: "0 12px",
  fontSize: 14,
  fontFamily: "inherit",
  color: "#0B1C30",
  outline: "none",
  width: "100%",
};

const SERVICE_TYPES = ["Heavy Stacking", "Light Stacking", "Maintenance Access", "Charging", "Inspection"];
const STATUS_OPTIONS: { value: ActivityStatus; label: string }[] = [
  { value: "completed", label: "Completed" },
  { value: "in-progress", label: "In Progress" },
  { value: "pending", label: "Pending" },
];

export function ActivityFormModal({ open, onOpenChange, initial, onSubmit, mode, vehicleOptions }: Props) {
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

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  function handleVehicleChange(vehicleId: string) {
    const v = vehicleOptions.find((o) => o.id === vehicleId);
    setForm((f) => ({
      ...f,
      vehicleId,
      vehicleName: v?.name ?? "",
      unitId: v?.unitId ?? "",
    }));
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

  const title = mode === "add" ? "New Log" : "Edit Log";

  const serviceChips = (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={labelStyle}>Service Type</label>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
        {SERVICE_TYPES.map((s) => {
          const active = form.serviceType === s;
          return (
            <button
              key={s}
              type="button"
              onClick={() => setForm((f) => ({ ...f, serviceType: s }))}
              style={{
                flexShrink: 0,
                padding: "8px 14px",
                borderRadius: 8,
                background: active ? "#004AC6" : "#EFF4FF",
                border: active ? "none" : "1px solid rgba(195,198,215,0.5)",
                color: active ? "#fff" : "#434655",
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "inherit",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {s}
            </button>
          );
        })}
      </div>
    </div>
  );

  const formBody = (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <label style={labelStyle}>Date &amp; Time</label>
        <DateTimePicker
          value={form.dateTime ? new Date(form.dateTime) : null}
          onChange={(date) => setForm((f) => ({ ...f, dateTime: date?.toISOString() ?? "" }))}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <label style={labelStyle}>Vehicle Assignment</label>
        <SelectDropdown
          value={form.vehicleId ?? ""}
          onChange={handleVehicleChange}
          options={[
            { value: "", label: "Select vehicle..." },
            ...vehicleOptions.map((v) => ({ value: v.id, label: `${v.name} - ${v.unitId}` })),
          ]}
          style={inputStyle}
        />
      </div>
      {serviceChips}
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1 }}>
          <label style={labelStyle}>Driver Name</label>
          <input
            value={form.driver ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, driver: e.target.value }))}
            placeholder="Driver name"
            style={inputStyle}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1 }}>
          <label style={labelStyle}>Status</label>
          <SelectDropdown
            value={form.status ?? "pending"}
            onChange={(val) => setForm((f) => ({ ...f, status: val as ActivityStatus }))}
            options={STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            style={inputStyle}
          />
        </div>
      </div>
    </div>
  );

  if (!open) return null;

  // MOBILE: bottom sheet
  if (isMobile) {
    return (
      <>
        <div className="mobile-sheet-overlay" onClick={() => onOpenChange(false)} />
        <div className="mobile-sheet">
          <div className="mobile-sheet-handle" />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
            <span style={{ fontWeight: 700, fontSize: 17, color: "#0B1C30" }}>{title}</span>
            <button onClick={() => onOpenChange(false)} style={{ width: 28, height: 28, border: "none", background: "none", color: "#737686", fontSize: 18, cursor: "pointer" }}>×</button>
          </div>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ maxHeight: "56vh", overflowY: "auto" }}>
              {formBody}
            </div>
            <button
              type="submit"
              disabled={saving}
              style={{ height: 48, borderRadius: 12, background: "#004AC6", border: "none", color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: "inherit", cursor: "pointer", opacity: saving ? 0.7 : 1, flexShrink: 0 }}
            >
              {saving ? "Saving..." : mode === "add" ? "Create Log" : "Save Changes"}
            </button>
          </form>
        </div>
      </>
    );
  }

  // DESKTOP: 2-section dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="overflow-y-auto"
        style={{
          maxWidth: 600,
          maxHeight: "88vh",
          borderRadius: 16,
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 700, fontSize: 18, color: "#0B1C30" }}>{title}</span>
          <button
            onClick={() => onOpenChange(false)}
            style={{ width: 28, height: 28, border: "none", background: "none", color: "#737686", fontSize: 18, cursor: "pointer", lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20, overflowY: "auto", paddingBottom: 4 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: "#0B1C30" }}>Basic Information</span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={labelStyle}>Date &amp; Time</label>
                <DateTimePicker
                  value={form.dateTime ? new Date(form.dateTime) : null}
                  onChange={(date) => setForm((f) => ({ ...f, dateTime: date?.toISOString() ?? "" }))}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={labelStyle}>Vehicle Assignment</label>
                <SelectDropdown
                  value={form.vehicleId ?? ""}
                  onChange={handleVehicleChange}
                  options={[
                    { value: "", label: "Select vehicle..." },
                    ...vehicleOptions.map((v) => ({ value: v.id, label: `${v.name} - ${v.unitId}` })),
                  ]}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          <div style={{ height: 1, background: "#E5E7EB" }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: "#0B1C30" }}>Operational Details</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={labelStyle}>Service Type</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {SERVICE_TYPES.map((s) => {
                  const active = form.serviceType === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, serviceType: s }))}
                      style={{
                        flexShrink: 0,
                        padding: "8px 14px",
                        borderRadius: 8,
                        background: active ? "#004AC6" : "#EFF4FF",
                        border: active ? "none" : "1px solid rgba(195,198,215,0.5)",
                        color: active ? "#fff" : "#434655",
                        fontSize: 12,
                        fontWeight: 600,
                        fontFamily: "inherit",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={labelStyle}>Driver Name</label>
                <input
                  value={form.driver ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, driver: e.target.value }))}
                  placeholder="Driver name"
                  style={inputStyle}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <label style={labelStyle}>Status</label>
                <SelectDropdown
                  value={form.status ?? "pending"}
                  onChange={(val) => setForm((f) => ({ ...f, status: val as ActivityStatus }))}
                  options={STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              style={{ height: 40, borderRadius: 8, background: "none", border: "none", color: "#004AC6", fontWeight: 500, fontSize: 14, padding: "0 20px", fontFamily: "inherit", cursor: "pointer" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{ height: 40, borderRadius: 8, background: "#004AC6", border: "none", color: "#fff", fontWeight: 500, fontSize: 14, padding: "0 20px", fontFamily: "inherit", boxShadow: "0 1px 2px rgba(0,0,0,0.05)", cursor: "pointer", opacity: saving ? 0.7 : 1 }}
            >
              {saving ? "Saving..." : mode === "add" ? "Create Log" : "Save Changes"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
