"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { SelectDropdown } from "@/components/ui/select-dropdown";
import { NotificationTemplate } from "@/lib/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Partial<NotificationTemplate>;
  onSubmit: (data: Partial<NotificationTemplate>) => Promise<void>;
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

const MAX_CHARS = 1024;

function PhonePreview({ message }: { message: string }) {
  const hasMessage = message.trim().length > 0;
  return (
    <div style={{ width: 240, margin: "0 auto", borderRadius: 28, background: "#1C1C1E", boxShadow: "0 0 0 3px #3A3A3C, 0 8px 24px rgba(0,0,0,0.15)", padding: 10, boxSizing: "border-box" }}>
      <div style={{ borderRadius: 20, overflow: "hidden", background: "#EFEAE2" }}>
        <div style={{ background: "#075E54", padding: "10px 12px", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 9999, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" fill="white" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.121.555 4.112 1.528 5.835L.057 23.854a.5.5 0 00.608.608l6.019-1.471A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.887 0-3.663-.491-5.204-1.351l-.373-.214-3.871.945.964-3.871-.228-.38A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" fill="white" />
            </svg>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>ChargeHub Alerts</span>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.8)" }}>Official Business Account</span>
          </div>
        </div>
        <div style={{ minHeight: 100, padding: "14px 10px", display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 8 }}>
          {!hasMessage && (
            <div style={{ alignSelf: "flex-start", background: "#fff", borderRadius: "12px 12px 12px 2px", padding: "10px 12px", display: "flex", gap: 4, boxShadow: "0 1px 1px rgba(0,0,0,0.1)" }}>
              <span className="typing-dot" style={{ width: 6, height: 6, borderRadius: 9999, background: "#9CA3AF", display: "block" }} />
              <span className="typing-dot" style={{ width: 6, height: 6, borderRadius: 9999, background: "#9CA3AF", display: "block" }} />
              <span className="typing-dot" style={{ width: 6, height: 6, borderRadius: 9999, background: "#9CA3AF", display: "block" }} />
            </div>
          )}
          {hasMessage && (
            <div style={{ alignSelf: "flex-start", maxWidth: "85%", background: "#fff", borderRadius: "12px 12px 12px 2px", padding: "8px 10px", boxShadow: "0 1px 1px rgba(0,0,0,0.1)" }}>
              <span style={{ fontSize: 12, lineHeight: "17px", color: "#111B21", whiteSpace: "pre-wrap" }}>{message}</span>
              <div style={{ textAlign: "right", marginTop: 2 }}>
                <span style={{ fontSize: 9, color: "#8696A0" }}>now ✓✓</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function TemplateFormModal({ open, onOpenChange, initial, onSubmit, mode }: Props) {
  const [isMobile, setIsMobile] = useState(false);
  const [form, setForm] = useState<Partial<NotificationTemplate> & { recipientGroup?: string }>(
    initial ?? {
      name: "",
      message: "",
      status: "active",
      employeeCount: 0,
      phoneCount: 0,
      lastSent: new Date().toISOString(),
      category: "General",
      recipientGroup: "All Employees",
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

  const charCount = (form.message ?? "").length;

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

  const title = mode === "add" ? "Create Template" : "Edit Template";

  const formFields = (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <label style={labelStyle}>Template Name</label>
        <input
          value={form.name ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="e.g. Low Battery Alert"
          style={inputStyle}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <label style={labelStyle}>Message Body</label>
        <textarea
          value={form.message ?? ""}
          onChange={(e) => {
            if (e.target.value.length <= MAX_CHARS) {
              setForm((f) => ({ ...f, message: e.target.value }));
            }
          }}
          placeholder="Type your WhatsApp message here..."
          rows={4}
          style={{ borderRadius: 10, background: "#EFF4FF", border: "1px solid #C3C6D7", padding: "10px 12px", fontSize: 14, fontFamily: "inherit", color: "#0B1C30", resize: "none", outline: "none", width: "100%" }}
        />
        <span style={{ alignSelf: "flex-end", fontSize: 11, fontWeight: 600, color: "#737686" }}>{charCount} / {MAX_CHARS}</span>
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1 }}>
          <label style={labelStyle}>Category</label>
          <SelectDropdown
            value={form.category ?? "General"}
            onChange={(val) => setForm((f) => ({ ...f, category: val }))}
            options={[
              { value: "General", label: "General" },
              { value: "Alert", label: "Alert" },
              { value: "Reminder", label: "Reminder" },
              { value: "Maintenance", label: "Maintenance" },
              { value: "Report", label: "Report" },
            ]}
            style={inputStyle}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1 }}>
          <label style={labelStyle}>Status</label>
          <SelectDropdown
            value={form.status ?? "active"}
            onChange={(val) => setForm((f) => ({ ...f, status: val as NotificationTemplate["status"] }))}
            options={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Draft" },
            ]}
            style={inputStyle}
          />
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <label style={labelStyle}>Recipient Group</label>
        <SelectDropdown
          value={(form as { recipientGroup?: string }).recipientGroup ?? "All Employees"}
          onChange={(val) => setForm((f) => ({ ...f, recipientGroup: val }))}
          options={[
            { value: "All Employees", label: "All Employees" },
            { value: "Drivers Only", label: "Drivers Only" },
            { value: "Fleet Managers", label: "Fleet Managers" },
          ]}
          style={inputStyle}
        />
      </div>
    </div>
  );

  if (!open) return null;

  // MOBILE: bottom sheet, single-column + preview below
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
            <div style={{ maxHeight: "56vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
              {formFields}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span style={labelStyle}>Live Preview</span>
                <PhonePreview message={form.message ?? ""} />
              </div>
            </div>
            <button type="submit" disabled={saving} style={{ height: 48, borderRadius: 12, background: "#004AC6", border: "none", color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: "inherit", cursor: "pointer", opacity: saving ? 0.7 : 1, flexShrink: 0 }}>
              {saving ? "Saving..." : "Save Template"}
            </button>
          </form>
        </div>
      </>
    );
  }

  // DESKTOP: 2-col dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="overflow-y-auto"
        style={{ maxWidth: 720, maxHeight: "88vh", borderRadius: 16, padding: 24, display: "flex", flexDirection: "column", gap: 16, boxShadow: "0 24px 60px rgba(0,0,0,0.25)" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 700, fontSize: 18, color: "#0B1C30" }}>{title}</span>
          <button onClick={() => onOpenChange(false)} style={{ width: 28, height: 28, border: "none", background: "none", color: "#737686", fontSize: 18, cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 24, overflowY: "auto" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {formFields}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={labelStyle}>Live Preview</span>
              <PhonePreview message={form.message ?? ""} />
            </div>
          </div>
          <button type="submit" disabled={saving} style={{ height: 48, borderRadius: 12, background: "#004AC6", border: "none", color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: "inherit", cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
            {saving ? "Saving..." : "Save Template"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
