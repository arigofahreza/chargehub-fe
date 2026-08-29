"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { fadeUpVariants } from "@/lib/motion";
import { useAuthStore } from "@/stores/useAuthStore";
import { getToken } from "@/lib/auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useImageUpload } from "@/components/hooks/use-image-upload";
import { ImagePlus, Pencil, X, Check, AtSign, Mail, Shield, User, Camera } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/* ─── Avatar upload section (inside dialog) ─── */
function AvatarUpload({ initials }: { initials: string }) {
  const { previewUrl, fileInputRef, handleThumbnailClick, handleFileChange } = useImageUpload();
  return (
    <div className="-mt-10 px-6">
      <div
        className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full"
        style={{ border: "4px solid #fff", background: "rgba(218,0,55,0.15)", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}
      >
        {previewUrl ? (
          <img src={previewUrl} className="h-full w-full object-cover" alt="Avatar" />
        ) : (
          <span className="text-xl font-bold" style={{ color: "var(--color-brand-primary)" }}>{initials}</span>
        )}
        <button
          type="button"
          onClick={handleThumbnailClick}
          className="absolute flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors"
          style={{ background: "rgba(0,0,0,0.55)", color: "#fff" }}
          aria-label="Ganti foto profil"
        >
          <ImagePlus size={14} strokeWidth={2} />
        </button>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
      </div>
    </div>
  );
}

/* ─── Profile info card (view mode) ─── */
function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 py-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0"
        style={{ background: "rgba(218,0,55,0.07)" }}>
        <Icon className="h-4 w-4" style={{ color: "var(--color-brand-primary)" }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs" style={{ color: "var(--color-muted-text)" }}>{label}</p>
        <p className="text-sm font-semibold truncate" style={{ color: "var(--color-ink)" }}>{value || "—"}</p>
      </div>
    </div>
  );
}

/* ─── Edit Profile Dialog (OriginUI pattern) ─── */
function EditProfileDialog({
  open,
  onClose,
  initials,
}: {
  open: boolean;
  onClose: () => void;
  initials: string;
}) {
  const user = useAuthStore((s) => s.user);
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const banner = useImageUpload();

  async function handleSave() {
    if (!firstName.trim()) { setSaveErr("Nama depan wajib diisi"); return; }
    setSaving(true); setSaveErr(null);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/v1/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim() || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { detail?: string }).detail ?? "Gagal menyimpan");
      }
      const updated = await res.json();
      const newFirstName = (updated.firstName as string) ?? firstName.trim();
      const newLastName = (updated.lastName as string) ?? lastName.trim();
      useAuthStore.setState((s) => ({
        user: s.user
          ? {
              ...s.user,
              firstName: newFirstName,
              lastName: newLastName,
              fullName: `${newFirstName} ${newLastName}`.trim(),
              email: (updated.email as string) ?? email.trim(),
            }
          : s.user,
      }));
      setSaved(true);
      setTimeout(() => { setSaved(false); onClose(); }, 800);
    } catch (err) {
      setSaveErr((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent
        showCloseButton={false}
        className="p-0 overflow-hidden gap-0"
        style={{ maxWidth: 480 }}
      >
        {/* ── Banner ── */}
        <div
          className="h-36 relative overflow-hidden"
          style={{
            background: banner.previewUrl ? undefined : "#F8F9FB",
            borderBottom: "1px solid rgba(195,198,215,0.4)",
          }}
        >
          {banner.previewUrl && (
            <img src={banner.previewUrl} className="absolute inset-0 h-full w-full object-cover" alt="" />
          )}
          {/* Banner upload button */}
          <button
            type="button"
            onClick={banner.handleThumbnailClick}
            className="absolute bottom-3 right-3 flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
            style={{ background: "rgba(0,0,0,0.35)", color: "#fff", border: "1px solid rgba(0,0,0,0.12)" }}
          >
            <Camera size={12} />
            Ganti Banner
          </button>
          <input type="file" ref={banner.fileInputRef} onChange={banner.handleFileChange} className="hidden" accept="image/*" />
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-lg transition-colors"
            style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}
          >
            <X size={14} />
          </button>
        </div>

        {/* ── Avatar overlapping banner ── */}
        <AvatarUpload initials={initials} />

        {/* ── Header ── */}
        <DialogHeader className="px-6 pt-3 pb-1">
          <DialogTitle>Edit Profil</DialogTitle>
          <p className="text-sm" style={{ color: "var(--color-muted-text)" }}>Perbarui informasi akun Anda.</p>
        </DialogHeader>

        {/* ── Form ── */}
        <div className="px-6 pb-5 space-y-4">
          {/* First + Last name */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ep-firstname">Nama Depan</Label>
              <Input
                id="ep-firstname"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Nama depan"
                disabled={saving}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ep-lastname">Nama Belakang</Label>
              <Input
                id="ep-lastname"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Nama belakang"
                disabled={saving}
              />
            </div>
          </div>

          {/* Username (readonly) */}
          <div className="space-y-1.5">
            <Label htmlFor="ep-username">Username</Label>
            <div className="relative">
              <Input
                id="ep-username"
                value={user?.username ?? ""}
                disabled
                className="pr-9 opacity-60 cursor-not-allowed"
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <Check size={14} strokeWidth={2} className="text-emerald-500" />
              </div>
            </div>
            <p className="text-xs" style={{ color: "var(--color-muted-text)" }}>Username tidak dapat diubah.</p>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="ep-email">Email</Label>
            <Input
              id="ep-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@perusahaan.id"
              disabled={saving}
            />
          </div>

          {saveErr && (
            <p className="text-xs px-3 py-2 rounded-lg" style={{ background: "#FEF2F2", color: "#DC2626" }}>
              {saveErr}
            </p>
          )}
        </div>

        {/* ── Footer ── */}
        <DialogFooter
          showCloseButton={false}
          className="px-6 pt-4 pb-8 gap-2 sm:flex-row sm:justify-end"
          style={{ borderTop: "1px solid rgba(195,198,215,0.5)", background: "rgba(248,249,255,0.6)" }}
        >
          <button
            onClick={onClose}
            disabled={saving}
            className="text-sm font-semibold px-4 py-2 transition-colors"
            style={{
              border: "1px solid rgba(195,198,215,0.7)", borderRadius: 8,
              background: "transparent", color: "var(--color-body)",
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !firstName.trim() || saved}
            className="text-sm font-semibold px-4 py-2 transition-all flex items-center gap-1.5"
            style={{
              background: saved ? "#059669" : "var(--color-brand-primary)",
              color: "#fff", borderRadius: 8, border: "none",
              cursor: saving || !firstName.trim() ? "not-allowed" : "pointer",
              opacity: saving || !firstName.trim() ? 0.65 : 1,
              fontFamily: "inherit",
            }}
          >
            {saved ? <><Check size={13} /> Tersimpan</> : saving ? "Menyimpan…" : "Simpan Perubahan"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Main profile page ─── */
export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const [editOpen, setEditOpen] = useState(false);

  if (!user) return null;

  const initials = (
    (user.firstName?.[0] ?? "") + (user.lastName?.[0] ?? "")
  ).toUpperCase() || user.username.slice(0, 2).toUpperCase();

  return (
    <motion.div variants={fadeUpVariants} initial="hidden" animate="visible">
      <main className="p-4 md:p-6 space-y-5">
        <div>
          <h1 style={{ fontWeight: 700, fontSize: 22, color: "#171717", letterSpacing: "-0.4px" }}>Profil Saya</h1>
          <p style={{ fontSize: 13, color: "#444444" }}>Informasi akun dan pengaturan profil.</p>
        </div>

        {/* Profile card */}
        <div className="overflow-hidden rounded-2xl" style={{ background: "#fff", border: "1px solid rgba(195,198,215,0.5)" }}>
          {/* Banner + centered avatar + edit button */}
          <div className="h-44 relative" style={{ background: "#F8F9FB", borderBottom: "1px solid rgba(195,198,215,0.4)" }}>
            <button
              onClick={() => setEditOpen(true)}
              className="absolute top-3 right-3 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 transition-colors"
              style={{ background: "var(--color-brand-primary)", color: "#fff", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(218,0,55,0.25)" }}
            >
              <Pencil size={12} />
              Edit Profil
            </button>

            {/* Avatar — centered, half inside banner */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-10">
              <div
                className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full"
                style={{ border: "3px solid rgba(195,198,215,0.7)", background: "rgba(218,0,55,0.08)", boxShadow: "0 4px 14px rgba(0,0,0,0.1)" }}
              >
                <span className="text-2xl font-bold" style={{ color: "var(--color-brand-primary)" }}>{initials}</span>
              </div>
            </div>
          </div>

          {/* Name + role centered */}
          <div className="pt-14 pb-5 text-center px-6">
            <p className="text-xl font-bold" style={{ color: "var(--color-ink)" }}>{user.fullName || user.username}</p>
            <span
              className="inline-block mt-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full"
              style={{
                background: user.role === "admin" ? "rgba(218,0,55,0.1)" : "rgba(16,185,129,0.1)",
                color: user.role === "admin" ? "var(--color-brand-primary)" : "#059669",
              }}
            >
              {user.role === "admin" ? "Admin" : "Operator"}
            </span>
          </div>

          {/* Divider + Info rows */}
          <div style={{ height: 1, background: "rgba(195,198,215,0.4)", margin: "0 24px" }} />
          <div className="px-6 pb-6 divide-y" style={{ borderColor: "rgba(195,198,215,0.3)" }}>
            <InfoRow icon={User} label="Nama Depan" value={user.firstName} />
            <InfoRow icon={User} label="Nama Belakang" value={user.lastName || "—"} />
            <InfoRow icon={AtSign} label="Username" value={user.username} />
            <InfoRow icon={Mail} label="Email" value={user.email || "Belum diatur"} />
            <InfoRow icon={Shield} label="Role" value={user.role === "admin" ? "Admin" : "Operator"} />
          </div>
        </div>
      </main>

      <EditProfileDialog open={editOpen} onClose={() => setEditOpen(false)} initials={initials} />
    </motion.div>
  );
}
