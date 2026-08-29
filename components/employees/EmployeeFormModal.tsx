"use client";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { SelectDropdown } from "@/components/ui/select-dropdown";
import { Employee } from "@/lib/types";
import { getJobTitles } from "@/lib/services/employees";
import { sheetVariants, sheetOverlayVariants } from "@/lib/motion";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Partial<Employee>;
  onSubmit: (data: Partial<Employee>) => Promise<void>;
  mode: "add" | "edit";
}

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: "#777777",
};

const inputStyle: React.CSSProperties = {
  height: 44,
  borderRadius: 10,
  background: "#fff",
  border: "1px solid #DEDEDE",
  padding: "0 12px",
  fontSize: 14,
  fontFamily: "inherit",
  color: "#171717",
  outline: "none",
  width: "100%",
};

export function EmployeeFormModal({ open, onOpenChange, initial, onSubmit, mode }: Props) {
  const [isMobile, setIsMobile] = useState(false);
  const [form, setForm] = useState<Partial<Employee>>(
    initial ?? { name: "", jobTitle: "", phone: "", status: "active", initials: "" }
  );
  const [saving, setSaving] = useState(false);
  const [jobTitles, setJobTitles] = useState<string[]>([]);

  useEffect(() => {
    getJobTitles().then(setJobTitles).catch(() => {});
  }, []);

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

  function set(key: keyof Employee, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(form);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  const title = mode === "add" ? "Tambah Karyawan" : "Edit Karyawan";

  const formBody = (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <label style={labelStyle}>Nama Lengkap</label>
        <input
          value={form.name ?? ""}
          onChange={(e) => {
            const v = e.target.value;
            const initials = v.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
            setForm((f) => ({ ...f, name: v, initials }));
          }}
          placeholder="cth. Budi Santoso"
          style={inputStyle}
        />
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1 }}>
          <label style={labelStyle}>Jabatan</label>
          <SelectDropdown
            value={form.jobTitle ?? ""}
            onChange={(val) => set("jobTitle", val)}
            options={[
              { value: "", label: "Pilih jabatan..." },
              ...jobTitles.map((t) => ({ value: t, label: t })),
            ]}
            style={inputStyle}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1 }}>
          <label style={labelStyle}>Telepon</label>
          <input type="tel" value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value)} placeholder="+62 812-0000-0000" style={inputStyle} />
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <label style={labelStyle}>Status</label>
        <SelectDropdown
          value={form.status ?? "active"}
          onChange={(val) => set("status", val)}
          options={[
            { value: "active", label: "Aktif" },
            { value: "on-leave", label: "Cuti" },
            { value: "inactive", label: "Tidak Aktif" },
          ]}
          style={inputStyle}
        />
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
              <div style={{ maxHeight: "56vh", overflowY: "auto" }}>
                {formBody}
              </div>
              <button
                type="submit"
                disabled={saving}
                style={{ height: 48, borderRadius: 12, background: "#DA0037", border: "none", color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: "inherit", cursor: "pointer", opacity: saving ? 0.7 : 1 }}
              >
                {saving ? "Menyimpan..." : "Simpan Karyawan"}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // DESKTOP: centered dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        style={{ maxWidth: 480, borderRadius: 16, padding: 24, display: "flex", flexDirection: "column", gap: 16, boxShadow: "0 24px 60px rgba(0,0,0,0.25)" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 700, fontSize: 18, color: "#171717" }}>{title}</span>
          <button onClick={() => onOpenChange(false)} style={{ width: 28, height: 28, border: "none", background: "rgba(0,0,0,0.06)", borderRadius: 8, color: "#777777", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={15} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12, overflowY: "auto" }}>
          {formBody}
          <button
            type="submit"
            disabled={saving}
            style={{ marginTop: 4, height: 48, borderRadius: 12, background: "#DA0037", border: "none", color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: "inherit", cursor: "pointer", opacity: saving ? 0.7 : 1 }}
          >
            {saving ? "Menyimpan..." : "Simpan Karyawan"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
