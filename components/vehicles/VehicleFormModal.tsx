"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { SelectDropdown } from "@/components/ui/select-dropdown";
import { Vehicle } from "@/lib/types";
import { createVehicle, uploadVehiclePhoto } from "@/lib/services/vehicles";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Partial<Vehicle>;
  onSubmit: (vehicle: Vehicle) => Promise<void>;
  mode: "add" | "edit";
}

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 500,
  color: "#434655",
};

const inputStyle: React.CSSProperties = {
  height: 46,
  borderRadius: 8,
  background: "#EFF4FF",
  border: "1px solid #C3C6D7",
  padding: "0 12px",
  fontSize: 14,
  fontFamily: "inherit",
  color: "#0B1C30",
  width: "100%",
  outline: "none",
};

const sectionTitle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 600,
  color: "#0B1C30",
};

const dividerStyle: React.CSSProperties = {
  height: 1,
  background: "#E5E7EB",
};

const VEHICLE_TYPES = ["Sedan", "SUV", "Van", "Pickup Truck", "Semi Truck"];
const YEARS = Array.from({ length: 10 }, (_, i) => String(new Date().getFullYear() - i));
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function UploadZone({
  file,
  previewUrl,
  error,
  onFile,
  onRemove,
}: {
  file: File | null;
  previewUrl: string | null;
  error: string | null;
  onFile: (f: File) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) onFile(dropped);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    if (picked) onFile(picked);
  }

  function formatSize(bytes: number) {
    return bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(0)} KB`
      : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  if (file && previewUrl) {
    return (
      <div
        style={{
          borderRadius: 12,
          border: "1px solid var(--color-border-ch)",
          background: "var(--color-surface)",
          padding: "12px 14px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={previewUrl}
          alt="Preview"
          style={{
            width: 64,
            height: 64,
            objectFit: "cover",
            borderRadius: 8,
            border: "1px solid var(--color-border-ch)",
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "var(--color-ink)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {file.name}
          </p>
          <p style={{ fontSize: 11, color: "var(--color-muted-text)", marginTop: 2 }}>
            {formatSize(file.size)}
          </p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          style={{
            border: "none",
            background: "none",
            color: "var(--color-error)",
            fontSize: 12,
            fontWeight: 600,
            fontFamily: "inherit",
            cursor: "pointer",
            padding: "4px 8px",
            borderRadius: 6,
            flexShrink: 0,
          }}
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        style={{
          borderRadius: 12,
          border: `2px dashed ${error ? "var(--color-error)" : dragging ? "var(--color-brand-primary)" : "var(--color-border-ch)"}`,
          background: dragging ? "rgba(0,74,198,0.04)" : "var(--color-surface)",
          padding: "22px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 5,
          alignItems: "center",
          cursor: "pointer",
          transition: "border-color 150ms, background 150ms",
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 16.5V19C4 19.55 4.45 20 5 20H19C19.55 20 20 19.55 20 19V16.5M12 3V15M12 3L7.5 7.5M12 3L16.5 7.5"
            stroke={dragging ? "var(--color-brand-primary)" : "#94A3B8"}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span style={{ fontSize: 13, color: "var(--color-body)", textAlign: "center" }}>
          <span style={{ color: "var(--color-brand-primary)", fontWeight: 600 }}>
            Click to upload
          </span>{" "}
          or drag &amp; drop
        </span>
        <span style={{ fontSize: 11, color: "var(--color-muted-text)" }}>
          PNG, JPG, WebP, GIF · max 5 MB
        </span>
      </div>
      {error && (
        <p style={{ fontSize: 11, color: "var(--color-error)", margin: 0 }}>{error}</p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        style={{ display: "none" }}
        onChange={handleChange}
      />
    </div>
  );
}

export function VehicleFormModal({ open, onOpenChange, initial, onSubmit, mode }: Props) {
  const [isMobile, setIsMobile] = useState(false);
  const [form, setForm] = useState<Partial<Vehicle> & { vehicleType?: string }>(
    initial ?? {
      name: "",
      fleetId: "",
      make: "",
      model: "",
      year: new Date().getFullYear(),
      vin: "",
      batteryCapacity: 75,
      maxRange: 400,
      assignedDriver: "",
      status: "available",
      batteryPercent: 100,
      photoUrl: "",
    }
  );
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function set(key: string, value: string | number) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const handleFile = useCallback((file: File) => {
    setPhotoError(null);
    if (file.size > MAX_FILE_SIZE) {
      setPhotoError("File exceeds 5 MB limit");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setPhotoError("File must be an image");
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPhotoFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }, [previewUrl]);

  function removeFile() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPhotoFile(null);
    setPreviewUrl(null);
    setPhotoError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (photoError) return;
    setSaving(true);
    setSubmitError(null);
    try {
      const vehicleName = form.name || `${form.make} ${form.model}`.trim();
      const payload = { ...form, name: vehicleName || form.make || "" };
      let vehicle = await createVehicle(payload as Omit<Vehicle, "id">);
      if (photoFile) {
        vehicle = await uploadVehiclePhoto(vehicle.id, photoFile);
      }
      await onSubmit(vehicle);
      onOpenChange(false);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const title = mode === "add" ? "Add Vehicle" : "Edit Vehicle";

  const formBody = (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Basic Information */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <span style={sectionTitle}>Basic Information</span>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Vehicle Make">
            <input value={form.make ?? ""} onChange={(e) => set("make", e.target.value)} placeholder="e.g. Tesla" style={inputStyle} />
          </Field>
          <Field label="Model">
            <input value={form.model ?? ""} onChange={(e) => set("model", e.target.value)} placeholder="e.g. Model Y" style={inputStyle} />
          </Field>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Year">
            <SelectDropdown
              value={String(form.year ?? "")}
              onChange={(val) => set("year", Number(val))}
              options={YEARS.map((y) => ({ value: y, label: y }))}
              style={inputStyle}
            />
          </Field>
          <Field label="Vehicle Type">
            <SelectDropdown
              value={(form as { vehicleType?: string }).vehicleType ?? ""}
              onChange={(val) => set("vehicleType", val)}
              options={[
                { value: "", label: "Select type..." },
                ...VEHICLE_TYPES.map((t) => ({ value: t, label: t })),
              ]}
              style={inputStyle}
            />
          </Field>
        </div>
        <Field label="VIN (Vehicle Identification Number)">
          <input
            value={form.vin ?? ""}
            onChange={(e) => set("vin", e.target.value.toUpperCase())}
            placeholder="e.g. 5YJ3E1EA4PF000001"
            style={{ ...inputStyle, textTransform: "uppercase" as const, letterSpacing: "0.5px" }}
          />
        </Field>
      </div>

      <div style={dividerStyle} />

      {/* Technical Specs */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <span style={sectionTitle}>Technical Specs</span>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Battery Capacity (kWh)">
            <input type="number" value={String(form.batteryCapacity ?? "")} onChange={(e) => set("batteryCapacity", Number(e.target.value))} style={inputStyle} />
          </Field>
          <Field label="Max Range (km)">
            <input type="number" value={String(form.maxRange ?? "")} onChange={(e) => set("maxRange", Number(e.target.value))} style={inputStyle} />
          </Field>
        </div>
      </div>

      <div style={dividerStyle} />

      {/* Assignment */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <span style={sectionTitle}>Assignment</span>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Assigned Driver">
            <input
              value={form.assignedDriver ?? ""}
              onChange={(e) => set("assignedDriver", e.target.value)}
              placeholder="Driver name or Unassigned"
              style={inputStyle}
            />
          </Field>
          <Field label="Fleet ID">
            <input value={form.fleetId ?? ""} onChange={(e) => set("fleetId", e.target.value)} placeholder="e.g. EV-2024-001" style={inputStyle} />
          </Field>
        </div>
      </div>

      <div style={dividerStyle} />

      {/* Vehicle Photo */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <span style={sectionTitle}>Vehicle Photo</span>
        <UploadZone
          file={photoFile}
          previewUrl={previewUrl}
          error={photoError}
          onFile={handleFile}
          onRemove={removeFile}
        />
        {saving && photoFile && (
          <p style={{ fontSize: 11, color: "var(--color-brand-primary)", margin: 0 }}>
            Uploading photo...
          </p>
        )}
      </div>

      {submitError && (
        <p style={{ fontSize: 12, color: "var(--color-error)", padding: "8px 12px", background: "var(--color-error-light)", borderRadius: 8, margin: 0 }}>
          {submitError}
        </p>
      )}
    </div>
  );

  if (!open) return null;

  const actions = (
    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexShrink: 0 }}>
      <button
        type="button"
        onClick={() => onOpenChange(false)}
        style={{ height: 40, borderRadius: 8, background: "none", border: "none", color: "#004AC6", fontWeight: 500, fontSize: 14, padding: "0 20px", fontFamily: "inherit", cursor: "pointer" }}
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={saving || !!photoError}
        style={{
          height: 40,
          borderRadius: 8,
          background: "#004AC6",
          border: "none",
          color: "#fff",
          fontWeight: 500,
          fontSize: 14,
          padding: "0 20px",
          fontFamily: "inherit",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          cursor: saving ? "not-allowed" : "pointer",
          opacity: saving || !!photoError ? 0.7 : 1,
        }}
      >
        {saving ? (photoFile ? "Uploading..." : "Saving...") : title}
      </button>
    </div>
  );

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
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1, overflow: "hidden" }}>
            <div style={{ overflowY: "auto", maxHeight: "64vh", paddingBottom: 4 }}>{formBody}</div>
            <button
              type="submit"
              disabled={saving || !!photoError}
              style={{ height: 48, borderRadius: 12, background: "#004AC6", border: "none", color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: "inherit", cursor: "pointer", opacity: saving || !!photoError ? 0.7 : 1, flexShrink: 0 }}
            >
              {saving ? (photoFile ? "Uploading..." : "Saving...") : title}
            </button>
          </form>
        </div>
      </>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="overflow-y-auto"
        showCloseButton={false}
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
          <button onClick={() => onOpenChange(false)} style={{ width: 28, height: 28, border: "none", background: "none", color: "#737686", fontSize: 18, cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20, overflowY: "auto", paddingBottom: 4 }}>
          {formBody}
          {actions}
        </form>
      </DialogContent>
    </Dialog>
  );
}
