"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { SelectDropdown } from "@/components/ui/select-dropdown";
import { Vehicle } from "@/lib/types";
import { createVehicle, updateVehicle, uploadVehiclePhoto } from "@/lib/services/vehicles";
import { getVehicleCategories } from "@/lib/services/management";
import { sheetVariants, sheetOverlayVariants } from "@/lib/motion";
import { X } from "lucide-react";

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
  color: "#444444",
};

const inputStyle: React.CSSProperties = {
  height: 46,
  borderRadius: 8,
  background: "#fff",
  border: "1px solid #DEDEDE",
  padding: "0 12px",
  fontSize: 14,
  fontFamily: "inherit",
  color: "#171717",
  width: "100%",
  outline: "none",
};

const sectionTitle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 600,
  color: "#171717",
};

const dividerStyle: React.CSSProperties = {
  height: 1,
  background: "#E5E7EB",
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={labelStyle}>
        {label}
        {required && <span style={{ color: "var(--color-error)", marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {error && <p style={{ fontSize: 11, color: "var(--color-error)", margin: 0 }}>{error}</p>}
    </div>
  );
}

const errorBorder = "1px solid var(--color-error)";

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
          Hapus
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
          background: dragging ? "rgba(218,0,55,0.04)" : "var(--color-surface)",
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
            Klik untuk unggah
          </span>{" "}
          atau seret &amp; lepas
        </span>
        <span style={{ fontSize: 11, color: "var(--color-muted-text)" }}>
          PNG, JPG, WebP, GIF - maks 5 MB
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
      vin: "",
      batteryCapacity: 75,
      status: "idle",
      batteryPercent: 100,
      photoUrl: "",
    }
  );
  const [vehicleTypes, setVehicleTypes] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    getVehicleCategories()
      .then((cats) => setVehicleTypes(cats.map((c) => c.name)))
      .catch(() => setVehicleTypes(["Wheel Loader", "Ekskavator", "Dump Truck", "Motor Grader"]));
  }, []);

  useEffect(() => {
    if (open) {
      setForm(
        initial ?? {
          name: "",
          fleetId: "",
          make: "",
          model: "",
          vin: "",
          batteryCapacity: 75,
          status: "idle",
          batteryPercent: 100,
          photoUrl: "",
        }
      );
      setPhotoFile(null);
      setPreviewUrl(null);
      setPhotoError(null);
      setSubmitError(null);
      setFieldErrors({});
    }
  }, [open, initial]);

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

  const canSave = !!(
    form.make?.trim() &&
    form.model?.trim() &&
    (form as { vehicleType?: string }).vehicleType?.trim() &&
    form.vin?.trim() &&
    form.batteryCapacity && Number(form.batteryCapacity) > 0
  );

  function set(key: string, value: string | number) {
    setForm((f) => ({ ...f, [key]: value }));
    setFieldErrors((e) => {
      if (!e[key]) return e;
      const next = { ...e };
      delete next[key];
      return next;
    });
  }

  function validate(): Record<string, string> {
    const errs: Record<string, string> = {};
    if (!form.make?.trim()) errs.make = "Merek wajib diisi";
    if (!form.model?.trim()) errs.model = "Model wajib diisi";
    if (!(form as { vehicleType?: string }).vehicleType?.trim()) errs.vehicleType = "Tipe wajib dipilih";
    if (!form.vin?.trim()) errs.vin = "Nomer unit wajib diisi";
    if (!form.batteryCapacity || Number(form.batteryCapacity) <= 0) errs.batteryCapacity = "Kapasitas baterai wajib diisi";
    return errs;
  }

  const handleFile = useCallback((file: File) => {
    setPhotoError(null);
    if (file.size > MAX_FILE_SIZE) {
      setPhotoError("File melebihi batas 5 MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setPhotoError("File harus berupa gambar");
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
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }
    setSaving(true);
    setSubmitError(null);
    try {
      const vehicleName = form.name || `${form.make} ${form.model}`.trim();
      const payload = { ...form, name: vehicleName || form.make || "" };
      let vehicle: Vehicle;
      if (mode === "edit" && initial?.id) {
        const updated = await updateVehicle(initial.id, payload);
        if (!updated) throw new Error("Update failed");
        vehicle = updated;
      } else {
        vehicle = await createVehicle(payload as Omit<Vehicle, "id">);
      }
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

  const title = mode === "add" ? "Tambah Kendaraan" : "Edit Kendaraan";

  const formBody = (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Informasi Dasar */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <span style={sectionTitle}>Informasi Dasar</span>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Merek Kendaraan" required error={fieldErrors.make}>
            <input value={form.make ?? ""} onChange={(e) => set("make", e.target.value)} placeholder="cth. Sany" style={fieldErrors.make ? { ...inputStyle, border: errorBorder } : inputStyle} />
          </Field>
          <Field label="Model" required error={fieldErrors.model}>
            <input value={form.model ?? ""} onChange={(e) => set("model", e.target.value)} placeholder="cth. SW9966" style={fieldErrors.model ? { ...inputStyle, border: errorBorder } : inputStyle} />
          </Field>
        </div>
        <Field label="Tipe Kendaraan" required error={fieldErrors.vehicleType}>
          <SelectDropdown
            value={(form as { vehicleType?: string }).vehicleType ?? ""}
            onChange={(val) => set("vehicleType", val)}
            options={[
              { value: "", label: "Pilih tipe..." },
              ...vehicleTypes.map((t) => ({ value: t, label: t })),
            ]}
            style={fieldErrors.vehicleType ? { ...inputStyle, border: errorBorder } : inputStyle}
          />
        </Field>
        <Field label="Nomer Unit" required error={fieldErrors.vin}>
          <input
            value={form.vin ?? ""}
            onChange={(e) => set("vin", e.target.value.toUpperCase())}
            placeholder="cth. 5901-01"
            style={{ ...inputStyle, border: fieldErrors.vin ? errorBorder : inputStyle.border, textTransform: "uppercase" as const, letterSpacing: "0.5px" }}
          />
        </Field>
      </div>

      <div style={dividerStyle} />

      {/* Spesifikasi Teknis */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <span style={sectionTitle}>Spesifikasi Teknis</span>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Kapasitas Baterai (kWh)" required error={fieldErrors.batteryCapacity}>
            <input type="number" value={String(form.batteryCapacity ?? "")} onChange={(e) => set("batteryCapacity", Number(e.target.value))} style={fieldErrors.batteryCapacity ? { ...inputStyle, border: errorBorder } : inputStyle} />
          </Field>
        </div>
        {mode === "edit" && (
          <Field label="Tingkat Penurunan Baterai (% per jam)">
            <input
              type="number"
              min={0.1}
              max={100}
              step={0.1}
              value={String(form.degradationRatePct ?? 2.0)}
              onChange={(e) => set("degradationRatePct", Number(e.target.value))}
              placeholder="cth. 2.0"
              style={inputStyle}
            />
            <p style={{ fontSize: 11, color: "#777777", margin: "2px 0 0" }}>
              Default: 2.0. Naikkan jika baterai lebih cepat habis dari sebelumnya.
            </p>
          </Field>
        )}
      </div>

      <div style={dividerStyle} />

      {/* Foto Kendaraan */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <span style={sectionTitle}>Foto Kendaraan</span>
        <UploadZone
          file={photoFile}
          previewUrl={previewUrl}
          error={photoError}
          onFile={handleFile}
          onRemove={removeFile}
        />
        {saving && photoFile && (
          <p style={{ fontSize: 11, color: "var(--color-brand-primary)", margin: 0 }}>
            Mengunggah foto...
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

  const actions = (
    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexShrink: 0 }}>
      <button
        type="button"
        onClick={() => onOpenChange(false)}
        style={{ height: 40, borderRadius: 8, background: "none", border: "none", color: "#DA0037", fontWeight: 500, fontSize: 14, padding: "0 20px", fontFamily: "inherit", cursor: "pointer" }}
      >
        Batal
      </button>
      <button
        type="submit"
        disabled={saving || !!photoError || !canSave}
        style={{
          height: 40,
          borderRadius: 8,
          background: "#DA0037",
          border: "none",
          color: "#fff",
          fontWeight: 500,
          fontSize: 14,
          padding: "0 20px",
          fontFamily: "inherit",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          cursor: canSave && !saving && !photoError ? "pointer" : "not-allowed",
          opacity: saving || !!photoError || !canSave ? 0.45 : 1,
        }}
      >
        {saving ? (photoFile ? "Mengunggah..." : "Menyimpan...") : title}
      </button>
    </div>
  );

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
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1, overflow: "hidden" }}>
              <div style={{ overflowY: "auto", maxHeight: "64vh", paddingBottom: 4 }}>{formBody}</div>
              <button
                type="submit"
                disabled={saving || !!photoError || !canSave}
                style={{ height: 48, borderRadius: 12, background: "#DA0037", border: "none", color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: "inherit", cursor: canSave && !saving && !photoError ? "pointer" : "not-allowed", opacity: saving || !!photoError || !canSave ? 0.45 : 1, flexShrink: 0 }}
              >
                {saving ? (photoFile ? "Mengunggah..." : "Menyimpan...") : title}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
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
          <span style={{ fontWeight: 700, fontSize: 18, color: "#171717" }}>{title}</span>
          <button onClick={() => onOpenChange(false)} style={{ width: 28, height: 28, border: "none", background: "rgba(0,0,0,0.06)", borderRadius: 8, color: "#777777", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={15} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20, overflowY: "auto", paddingBottom: 4 }}>
          {formBody}
          {actions}
        </form>
      </DialogContent>
    </Dialog>
  );
}
