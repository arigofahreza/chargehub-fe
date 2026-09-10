"use client";
import { useState } from "react";
import { Eye, EyeOff, User, Lock, Phone, IdCard, Briefcase, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { registerUser, type AdminUser, type EmployeeCategory } from "@/lib/services/management";

function InputField({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  icon: Icon,
  rightEl,
  disabled,
  autoComplete,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  icon: React.ElementType;
  rightEl?: React.ReactNode;
  disabled?: boolean;
  autoComplete?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-muted-text)" }}>
        {label}
      </label>
      <div className="relative">
        <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--color-muted-text)" }} />
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          autoComplete={autoComplete}
          className={cn(
            "w-full h-10 pl-10 pr-4 text-sm outline-none transition-all",
            "border bg-[#F4F5F7]",
            "placeholder:text-gray-400",
            "focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white",
            rightEl && "pr-10"
          )}
          style={{ borderRadius: 8, borderColor: "rgba(195,198,215,0.7)", color: "var(--color-ink)", fontFamily: "inherit" }}
        />
        {rightEl && <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightEl}</div>}
      </div>
    </div>
  );
}

interface Props {
  employeeCategories: EmployeeCategory[];
  onSuccess: (user: AdminUser) => void;
  onClose: () => void;
}

export function RegisterUserModal({ employeeCategories, onSuccess, onClose }: Props) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [jabatan, setJabatan] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const phoneValid = !phone || /^\+?[\d\s\-\(\)]{8,15}$/.test(phone.trim());

  const pwRules = [
    { label: "A-Z", ok: /[A-Z]/.test(password) },
    { label: "a-z", ok: /[a-z]/.test(password) },
    { label: "0-9", ok: /\d/.test(password) },
    { label: "#!@", ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const pwMinLen = password.length >= 8;
  const pwStrong = pwMinLen && pwRules.every((r) => r.ok);

  async function handleSubmit() {
    setErr(null);
    if (!firstName.trim()) { setErr("Nama depan wajib diisi"); return; }
    if (!lastName.trim()) { setErr("Nama belakang wajib diisi"); return; }
    if (!jabatan) { setErr("Jabatan wajib dipilih"); return; }
    if (!username.trim()) { setErr("Username wajib diisi"); return; }
    if (!phone.trim() || !phoneValid) { setErr("Nomor telepon tidak valid"); return; }
    if (!pwStrong) { setErr("Password belum memenuhi semua syarat keamanan"); return; }
    if (password !== confirm) { setErr("Konfirmasi password tidak cocok"); return; }

    setLoading(true);
    try {
      const newUser = await registerUser({ username, phone, firstName, lastName, password, jabatan });
      onSuccess(newUser);
    } catch (e) {
      const raw = (e as Error).message;
      const match = raw.match(/API \d+: (.*)/);
      if (match) {
        try {
          const parsed = JSON.parse(match[1]);
          setErr(parsed.detail ?? raw);
        } catch {
          setErr(raw);
        }
      } else {
        setErr(raw);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md overflow-y-auto"
        style={{
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          maxHeight: "90vh",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4" style={{ borderBottom: "1px solid #EDEDED" }}>
          <div>
            <h2 style={{ fontWeight: 700, fontSize: 16, color: "#171717", letterSpacing: "-0.3px" }}>Daftarkan Pengguna Baru</h2>
            <p style={{ fontSize: 12, color: "#888", marginTop: 2 }}>Akun baru akan terdaftar sebagai employee.</p>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 6, color: "#888" }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-4">
          {err && (
            <div className="text-sm px-3 py-2.5 rounded-lg flex items-start gap-2" style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}>
              <span className="flex-shrink-0">⚠</span>
              {err}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <InputField id="reg-fn" label="Nama Depan *" placeholder="nama depan" value={firstName} onChange={setFirstName} icon={IdCard} disabled={loading} />
            <InputField id="reg-ln" label="Nama Belakang *" placeholder="nama belakang" value={lastName} onChange={setLastName} icon={IdCard} disabled={loading} />
          </div>

          {/* Jabatan */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="reg-jabatan" className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-muted-text)" }}>
              Jabatan *
            </label>
            <div className="relative">
              <Briefcase size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--color-muted-text)" }} />
              <select
                id="reg-jabatan"
                value={jabatan}
                onChange={(e) => setJabatan(e.target.value)}
                disabled={loading}
                className="w-full h-10 pl-10 pr-4 text-sm outline-none transition-all border bg-[#F4F5F7] focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white appearance-none"
                style={{ borderRadius: 8, borderColor: "rgba(195,198,215,0.7)", color: jabatan ? "var(--color-ink)" : "#9CA3AF", fontFamily: "inherit" }}
              >
                <option value="" disabled>pilih jabatan...</option>
                {employeeCategories.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InputField id="reg-username" label="Username *" placeholder="username" value={username} onChange={setUsername} icon={User} disabled={loading} autoComplete="off" />
            <div className="flex flex-col gap-1">
              <InputField id="reg-phone" label="No. Telepon *" type="tel" placeholder="08xxxxxxxxxx" value={phone} onChange={setPhone} icon={Phone} disabled={loading} autoComplete="off" />
              {phone && !phoneValid && <p className="text-xs font-medium" style={{ color: "#DC2626" }}>✗ Format tidak valid</p>}
              {phone && phoneValid && <p className="text-xs font-medium" style={{ color: "#166534" }}>✓ Nomor valid</p>}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <InputField
              id="reg-pw" label="Password" type={showPw ? "text" : "password"}
              placeholder="min 8 karakter" value={password} onChange={setPassword}
              icon={Lock} disabled={loading} autoComplete="new-password"
              rightEl={
                <button type="button" onClick={() => setShowPw(!showPw)} className="p-0.5" style={{ color: "var(--color-muted-text)" }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />
            {password && (
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: pwMinLen ? "#F0FDF4" : "#FEF2F2", color: pwMinLen ? "#166534" : "#DC2626", border: `1px solid ${pwMinLen ? "#BBF7D0" : "#FECACA"}` }}>
                  {pwMinLen ? "✓" : "✗"} 8+ char
                </span>
                {pwRules.map(({ label, ok }) => (
                  <span key={label} className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: ok ? "#F0FDF4" : "#FEF2F2", color: ok ? "#166534" : "#DC2626", border: `1px solid ${ok ? "#BBF7D0" : "#FECACA"}` }}>
                    {ok ? "✓" : "✗"} {label}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <InputField
              id="reg-confirm" label="Konfirmasi Password" type={showConfirm ? "text" : "password"}
              placeholder="ulangi password" value={confirm} onChange={setConfirm}
              icon={Lock} disabled={loading} autoComplete="new-password"
              rightEl={
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="p-0.5" style={{ color: "var(--color-muted-text)" }}>
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />
            {confirm && password !== confirm && <p className="text-xs font-medium" style={{ color: "#DC2626" }}>✗ Password tidak cocok</p>}
            {confirm && password === confirm && password && <p className="text-xs font-medium" style={{ color: "#166534" }}>✓ Password cocok</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              height: 38, padding: "0 16px", borderRadius: 8,
              border: "1px solid #EDEDED", background: "#F4F5F7",
              fontSize: 13, fontWeight: 600, color: "#555", cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !username || !phone || !phoneValid || !firstName || !lastName || !jabatan || !pwStrong || !confirm || password !== confirm}
            style={{
              height: 38, padding: "0 20px", borderRadius: 8,
              background: "var(--color-brand-primary)",
              fontSize: 13, fontWeight: 700, color: "#fff", cursor: "pointer", fontFamily: "inherit",
              opacity: loading || !username || !phone || !phoneValid || !firstName || !lastName || !jabatan || !pwStrong || !confirm || password !== confirm ? 0.6 : 1,
              border: "none",
            }}
          >
            {loading ? "Mendaftar…" : "Daftarkan"}
          </button>
        </div>
      </div>
    </div>
  );
}
