"use client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { SelectDropdown } from "@/components/ui/select-dropdown";
import { Employee } from "@/lib/types";

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
  color: "#737686",
};

const inputStyle: React.CSSProperties = {
  height: 44,
  borderRadius: 10,
  background: "#EFF4FF",
  border: "1px solid #C3C6D7",
  padding: "0 12px",
  fontSize: 14,
  fontFamily: "inherit",
  color: "#0B1C30",
  outline: "none",
  width: "100%",
};

export function EmployeeFormModal({ open, onOpenChange, initial, onSubmit, mode }: Props) {
  const [isMobile, setIsMobile] = useState(false);
  const [form, setForm] = useState<Partial<Employee>>(
    initial ?? { name: "", email: "", jobTitle: "", phone: "", status: "active", initials: "" }
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

  const title = mode === "add" ? "Add Employee" : "Edit Employee";

  const formBody = (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <label style={labelStyle}>Full Name</label>
        <input
          value={form.name ?? ""}
          onChange={(e) => {
            const v = e.target.value;
            const initials = v.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
            setForm((f) => ({ ...f, name: v, initials }));
          }}
          placeholder="e.g. Alex Carter"
          style={inputStyle}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <label style={labelStyle}>Email</label>
        <input type="email" value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} placeholder="name@company.com" style={inputStyle} />
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1 }}>
          <label style={labelStyle}>Job Title</label>
          <input value={form.jobTitle ?? ""} onChange={(e) => set("jobTitle", e.target.value)} placeholder="e.g. Driver" style={inputStyle} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1 }}>
          <label style={labelStyle}>Phone</label>
          <input type="tel" value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value)} placeholder="+1 555-0100" style={inputStyle} />
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <label style={labelStyle}>Status</label>
        <SelectDropdown
          value={form.status ?? "active"}
          onChange={(val) => set("status", val)}
          options={[
            { value: "active", label: "Active" },
            { value: "on-leave", label: "On Leave" },
            { value: "inactive", label: "Inactive" },
          ]}
          style={inputStyle}
        />
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
              style={{ height: 48, borderRadius: 12, background: "#004AC6", border: "none", color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: "inherit", cursor: "pointer", opacity: saving ? 0.7 : 1 }}
            >
              {saving ? "Saving..." : "Save Employee"}
            </button>
          </form>
        </div>
      </>
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
          <span style={{ fontWeight: 700, fontSize: 18, color: "#0B1C30" }}>{title}</span>
          <button onClick={() => onOpenChange(false)} style={{ width: 28, height: 28, border: "none", background: "none", color: "#737686", fontSize: 18, cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12, overflowY: "auto" }}>
          {formBody}
          <button
            type="submit"
            disabled={saving}
            style={{ marginTop: 4, height: 48, borderRadius: 12, background: "#004AC6", border: "none", color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: "inherit", cursor: "pointer", opacity: saving ? 0.7 : 1 }}
          >
            {saving ? "Saving..." : "Save Employee"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
