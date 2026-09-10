"use client";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { SelectDropdown } from "@/components/ui/select-dropdown";
import { NotificationTemplate } from "@/lib/types";
import { sheetVariants, sheetOverlayVariants } from "@/lib/motion";
import { X } from "lucide-react";

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

const MAX_CHARS = 1024;

function PhonePreview({ message }: { message: string }) {
  const hasMessage = message.trim().length > 0;
  return (
    <div style={{ width: 240, margin: "0 auto", borderRadius: 28, background: "#1C1C1E", boxShadow: "0 0 0 3px #3A3A3C, 0 8px 24px rgba(0,0,0,0.15)", padding: 10, boxSizing: "border-box", display: "flex", flexDirection: "column", height: 340 }}>
      <div style={{ borderRadius: 20, overflow: "hidden", background: "#F0F2F5", display: "flex", flexDirection: "column", flex: 1 }}>
        {/* Telegram header */}
        <div style={{ background: "#2AABEE", padding: "10px 12px", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div style={{ width: 26, height: 26, borderRadius: 9999, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {/* Telegram paper plane icon */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <path d="M22.265 2.428a1.5 1.5 0 00-1.595-.324L2.042 9.122a1.5 1.5 0 00.093 2.817l4.461 1.416 2.177 6.534a1.5 1.5 0 002.557.47l2.54-2.977 4.984 3.738a1.5 1.5 0 002.332-1.01l2.813-16.085a1.5 1.5 0 00-.734-1.597zM9.19 13.987l-.894 3.573-1.47-4.41 8.654-5.771-6.29 6.608zm9.775 4.506l-4.988-3.741 3.417-3.593-2.61 6.878.181.456z"/>
            </svg>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>AMEV Alerts</span>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.85)" }}>bot</span>
          </div>
        </div>

        {/* Chat area */}
        <div style={{ flex: 1, minHeight: 100, padding: "14px 10px", display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 8, overflowY: "auto", background: "#F0F2F5" }}>
          {!hasMessage && (
            <div style={{ alignSelf: "flex-start", background: "#fff", borderRadius: "12px 12px 12px 2px", padding: "10px 12px", display: "flex", gap: 4, boxShadow: "0 1px 2px rgba(0,0,0,0.12)" }}>
              <span className="typing-dot" style={{ width: 6, height: 6, borderRadius: 9999, background: "#9CA3AF", display: "block" }} />
              <span className="typing-dot" style={{ width: 6, height: 6, borderRadius: 9999, background: "#9CA3AF", display: "block" }} />
              <span className="typing-dot" style={{ width: 6, height: 6, borderRadius: 9999, background: "#9CA3AF", display: "block" }} />
            </div>
          )}
          {hasMessage && (
            <div style={{ alignSelf: "flex-start", maxWidth: "88%", background: "#fff", borderRadius: "12px 12px 12px 2px", padding: "8px 10px", boxShadow: "0 1px 2px rgba(0,0,0,0.12)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#2AABEE" }}>AMEV Alerts</span>
              </div>
              <span style={{ fontSize: 12, lineHeight: "17px", color: "#111", whiteSpace: "pre-wrap" }}>{message}</span>
              <div style={{ textAlign: "right", marginTop: 3 }}>
                <span style={{ fontSize: 9, color: "#8B8B8B" }}>now ✓✓</span>
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
  const [form, setForm] = useState<Partial<NotificationTemplate>>(
    initial ?? {
      name: "",
      message: "",
      status: "active",
      phoneCount: 0,
      lastSent: new Date().toISOString(),
      category: "General",
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
    if (open) {
      setForm(
        initial ?? {
          name: "",
          message: "",
          status: "active",
          phoneCount: 0,
          lastSent: new Date().toISOString(),
          category: "General",
        }
      );
    }
  }, [open, initial]);

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

  const title = mode === "add" ? "Buat Template" : "Edit Template";

  const formFields = (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <label style={labelStyle}>Nama Template</label>
        <input
          value={form.name ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="cth. Peringatan Baterai Lemah"
          style={inputStyle}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <label style={labelStyle}>Isi Pesan</label>
        <textarea
          value={form.message ?? ""}
          onChange={(e) => {
            if (e.target.value.length <= MAX_CHARS) {
              setForm((f) => ({ ...f, message: e.target.value }));
            }
          }}
          placeholder="Ketik pesan WhatsApp di sini..."
          rows={4}
          style={{ borderRadius: 10, background: "#fff", border: "1px solid #DEDEDE", padding: "10px 12px", fontSize: 14, fontFamily: "inherit", color: "#171717", resize: "none", outline: "none", width: "100%" }}
        />
        <span style={{ alignSelf: "flex-end", fontSize: 11, fontWeight: 600, color: "#777777" }}>{charCount} / {MAX_CHARS}</span>
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 5, flex: 1 }}>
          <label style={labelStyle}>Kategori</label>
          <SelectDropdown
            value={form.category ?? "General"}
            onChange={(val) => setForm((f) => ({ ...f, category: val }))}
            options={[
              { value: "General", label: "Umum" },
              { value: "Alert", label: "Peringatan" },
              { value: "Reminder", label: "Pengingat" },
              { value: "Maintenance", label: "Perawatan" },
              { value: "Report", label: "Laporan" },
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
              { value: "active", label: "Aktif" },
              { value: "inactive", label: "Draf" },
            ]}
            style={inputStyle}
          />
        </div>
      </div>
    </div>
  );

  // MOBILE: bottom sheet, single-column + preview below
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
                {formFields}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <span style={labelStyle}>Pratinjau Langsung</span>
                  <PhonePreview message={form.message ?? ""} />
                </div>
              </div>
              <button type="submit" disabled={saving} style={{ height: 48, borderRadius: 12, background: "#DA0037", border: "none", color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: "inherit", cursor: "pointer", opacity: saving ? 0.7 : 1, flexShrink: 0 }}>
                {saving ? "Menyimpan..." : "Simpan Template"}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
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
          <span style={{ fontWeight: 700, fontSize: 18, color: "#171717" }}>{title}</span>
          <button onClick={() => onOpenChange(false)} style={{ width: 28, height: 28, border: "none", background: "rgba(0,0,0,0.06)", borderRadius: 8, color: "#777777", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={15} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 24, overflowY: "auto" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {formFields}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={labelStyle}>Pratinjau Langsung</span>
              <PhonePreview message={form.message ?? ""} />
            </div>
          </div>
          <button type="submit" disabled={saving} style={{ height: 48, borderRadius: 12, background: "#DA0037", border: "none", color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: "inherit", cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
            {saving ? "Menyimpan..." : "Simpan Template"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
