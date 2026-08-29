"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, User, Lock, Mail, IdCard, ArrowRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";

type Mode = "login" | "register";

function InputField({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  onKeyDown,
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
  onKeyDown?: (e: React.KeyboardEvent) => void;
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
        <Icon
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "var(--color-muted-text)" }}
        />
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={disabled}
          autoComplete={autoComplete}
          className={cn(
            "w-full h-11 pl-10 pr-4 text-sm outline-none transition-all",
            "border bg-[#F4F5F7]",
            "placeholder:text-gray-400",
            "focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white",
            rightEl && "pr-10"
          )}
          style={{
            borderRadius: 10,
            borderColor: "rgba(195,198,215,0.7)",
            color: "var(--color-ink)",
            fontFamily: "inherit",
          }}
        />
        {rightEl && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightEl}</div>
        )}
      </div>
    </div>
  );
}

export default function AuthSwitch() {
  const router = useRouter();
  const { login, register, isLoading, error } = useAuthStore();
  const [mode, setMode] = useState<Mode>("login");
  const [mounted, setMounted] = useState(false);

  // Login
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  // Register
  const [rFirstName, setRFirstName] = useState("");
  const [rLastName, setRLastName] = useState("");
  const [rUsername, setRUsername] = useState("");
  const [rEmail, setREmail] = useState("");
  const [rPassword, setRPassword] = useState("");
  const [rConfirm, setRConfirm] = useState("");
  const [showRPw, setShowRPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [localErr, setLocalErr] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  function switchMode(m: Mode) {
    setMode(m);
    setLocalErr(null);
    setSuccess(false);
    useAuthStore.setState({ error: null });
  }

  async function handleLogin() {
    await login(username, password);
    if (!useAuthStore.getState().error) router.push("/dashboard");
  }

  const emailValid = !rEmail || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(rEmail);

  const pwRules = [
    { label: "A-Z", ok: /[A-Z]/.test(rPassword) },
    { label: "a-z", ok: /[a-z]/.test(rPassword) },
    { label: "0-9", ok: /\d/.test(rPassword) },
    { label: "#!@", ok: /[^A-Za-z0-9]/.test(rPassword) },
  ];
  const pwMinLen = rPassword.length >= 8;
  const pwStrong = pwMinLen && pwRules.every((r) => r.ok);

  async function handleRegister() {
    setLocalErr(null);
    if (!rFirstName.trim()) { setLocalErr("Nama depan wajib diisi"); return; }
    if (!emailValid || !rEmail) { setLocalErr("Format email tidak valid"); return; }
    if (!pwStrong) { setLocalErr("Password belum memenuhi semua syarat keamanan"); return; }
    if (rPassword !== rConfirm) { setLocalErr("Konfirmasi password tidak cocok"); return; }
    const ok = await register(rUsername, rEmail, rFirstName, rLastName, rPassword);
    if (ok) {
      setSuccess(true);
      setRFirstName(""); setRLastName(""); setRUsername(""); setREmail(""); setRPassword(""); setRConfirm("");
    }
  }

  const displayErr = localErr ?? error;

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel: image only ── */}
      <div
        className="hidden lg:flex flex-col items-center justify-center flex-1 relative overflow-hidden"
        style={{ background: "#EBEBEB" }}
      >
        <div className="relative w-[100%] h-[100%]">
          <Image src="/assets/login-hero.jpg" alt="Fleet" fill priority className="object-contain" />
        </div>
      </div>

      {/* ── Right panel: form ── */}
      <div
        className="flex flex-col items-center justify-center w-full lg:w-[480px] px-8 py-12 overflow-y-auto"
        style={{ background: "#FFFFFF", minHeight: "100dvh" }}
      >
        <div className="w-full max-w-sm space-y-7">
          {/* ── Logo ── */}
          <div className="flex flex-col items-center gap-2 pb-1">
            <Image src="/assets/amm.png" alt="AMEV" width={48} height={48} className="object-contain" style={{ width: 48, height: "auto" }} />
            <span style={{ fontSize: 22, fontWeight: 800, color: "var(--color-ink)", letterSpacing: "-0.5px" }}>AMEV</span>
          </div>

          {/* ── Tab toggle ── */}
          <div
            className="flex p-1 gap-1 relative"
            style={{ background: "#EDEDED", borderRadius: 14 }}
          >
            {/* Sliding highlight */}
            <div
              className="absolute top-1 bottom-1 transition-all duration-200"
              style={{
                left: mode === "login" ? 4 : "calc(50% + 2px)",
                width: "calc(50% - 6px)",
                background: "white",
                borderRadius: 10,
                boxShadow: "0 1px 6px rgba(0,0,0,0.12)",
              }}
            />
            {(["login", "register"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className="relative flex-1 text-sm font-semibold py-2.5 transition-colors z-10"
                style={{ color: mode === m ? "var(--color-brand-primary)" : "var(--color-muted-text)" }}
              >
                {m === "login" ? "Masuk" : "Daftar"}
              </button>
            ))}
          </div>

          {/* ── Header ── */}
          <div>
            <h2 className="text-2xl font-extrabold" style={{ color: "var(--color-ink)", letterSpacing: "-0.5px" }}>
              {mode === "login" ? "Selamat Datang!" : "Membuat Akun Baru"}
            </h2>
            <p className="text-sm mt-1" style={{ color: "var(--color-muted-text)" }}>
              {mode === "login" ? "Masuk untuk mengelola armada Anda." : "Isi data di bawah untuk mendaftar."}
            </p>
          </div>

          {/* ── Alerts ── */}
          {displayErr && (
            <div className="text-sm px-4 py-3 rounded-xl flex items-start gap-2.5" style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}>
              <span className="mt-0.5 flex-shrink-0">⚠</span>
              {displayErr}
            </div>
          )}
          {success && (
            <div className="text-sm px-4 py-3 rounded-xl flex items-center gap-2.5" style={{ background: "#F0FDF4", color: "#166534", border: "1px solid #BBF7D0" }}>
              <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
              Akun berhasil dibuat. Silakan masuk.
            </div>
          )}

          <AnimatePresence mode="wait">
            {mode === "login" ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="space-y-4"
              >
                {/* ── LOGIN ── */}
                <InputField
                  id="login-username" label="Username" placeholder="username"
                  value={username} onChange={setUsername}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  icon={User} disabled={isLoading} autoComplete="username"
                />
                <InputField
                  id="login-password" label="Password" type={showPw ? "text" : "password"}
                  placeholder="••••••••" value={password} onChange={setPassword}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  icon={Lock} disabled={isLoading} autoComplete="current-password"
                  rightEl={
                    <button type="button" onClick={() => setShowPw(!showPw)} className="p-0.5" style={{ color: "var(--color-muted-text)" }}>
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  }
                />

                <button
                  onClick={handleLogin}
                  disabled={isLoading || !username || !password}
                  className="w-full h-11 flex items-center justify-center gap-2 text-sm font-bold text-white transition-opacity"
                  style={{
                    borderRadius: 10,
                    background: "var(--color-brand-primary)",
                    boxShadow: "0 4px 12px rgba(218,0,55,0.3)",
                    opacity: isLoading || !username || !password ? 0.6 : 1,
                  }}
                >
                  {isLoading ? "Masuk…" : (
                    <>Masuk <ArrowRight size={15} /></>
                  )}
                </button>

                <p className="text-center text-sm" style={{ color: "var(--color-muted-text)" }}>
                  Belum punya akun?{" "}
                  <button type="button" onClick={() => switchMode("register")} className="font-semibold hover:underline" style={{ color: "var(--color-brand-primary)" }}>
                    Daftar sekarang
                  </button>
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="register"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="space-y-4"
              >
                {/* ── REGISTER ── */}
                <div className="grid grid-cols-2 gap-3">
                  <InputField
                    id="reg-firstname" label="Nama Depan" placeholder="nama depan"
                    value={rFirstName} onChange={setRFirstName} icon={IdCard} disabled={isLoading}
                  />
                  <InputField
                    id="reg-lastname" label="Nama Belakang" placeholder="nama belakang"
                    value={rLastName} onChange={setRLastName} icon={IdCard} disabled={isLoading}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <InputField
                    id="reg-username" label="Username" placeholder="username"
                    value={rUsername} onChange={setRUsername} icon={User} disabled={isLoading} autoComplete="username"
                  />
                  <div className="flex flex-col gap-1">
                    <InputField
                      id="reg-email" label="Email" type="email" placeholder="email@co.id"
                      value={rEmail} onChange={setREmail} icon={Mail} disabled={isLoading} autoComplete="email"
                    />
                    {rEmail && !emailValid && (
                      <p className="text-xs font-medium" style={{ color: "#DC2626" }}>
                        ✗ Format email tidak valid
                      </p>
                    )}
                    {rEmail && emailValid && (
                      <p className="text-xs font-medium" style={{ color: "#166534" }}>
                        ✓ Email valid
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <InputField
                    id="reg-password" label="Password" type={showRPw ? "text" : "password"}
                    placeholder="min 8 karakter" value={rPassword} onChange={setRPassword}
                    icon={Lock} disabled={isLoading} autoComplete="new-password"
                    rightEl={
                      <button type="button" onClick={() => setShowRPw(!showRPw)} className="p-0.5" style={{ color: "var(--color-muted-text)" }}>
                        {showRPw ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    }
                  />
                  {rPassword && (
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium transition-colors"
                        style={{
                          background: pwMinLen ? "#F0FDF4" : "#FEF2F2",
                          color: pwMinLen ? "#166534" : "#DC2626",
                          border: `1px solid ${pwMinLen ? "#BBF7D0" : "#FECACA"}`,
                        }}
                      >
                        {pwMinLen ? "✓" : "✗"} 8+ char
                      </span>
                      {pwRules.map(({ label, ok }) => (
                        <span
                          key={label}
                          className="text-xs px-2 py-0.5 rounded-full font-medium transition-colors"
                          style={{
                            background: ok ? "#F0FDF4" : "#FEF2F2",
                            color: ok ? "#166534" : "#DC2626",
                            border: `1px solid ${ok ? "#BBF7D0" : "#FECACA"}`,
                          }}
                        >
                          {ok ? "✓" : "✗"} {label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <InputField
                    id="reg-confirm" label="Konfirmasi Password" type={showConfirmPw ? "text" : "password"}
                    placeholder="ulangi password" value={rConfirm} onChange={setRConfirm}
                    onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                    icon={Lock} disabled={isLoading} autoComplete="new-password"
                    rightEl={
                      <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="p-0.5" style={{ color: "var(--color-muted-text)" }}>
                        {showConfirmPw ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    }
                  />
                  {rConfirm && rPassword !== rConfirm && (
                    <p className="text-xs font-medium" style={{ color: "#DC2626" }}>
                      ✗ Password tidak cocok
                    </p>
                  )}
                  {rConfirm && rPassword === rConfirm && rPassword && (
                    <p className="text-xs font-medium" style={{ color: "#166534" }}>
                      ✓ Password cocok
                    </p>
                  )}
                </div>

                <button
                  onClick={handleRegister}
                  disabled={isLoading || !rUsername || !rEmail || !rFirstName || !rPassword || !rConfirm}
                  className="w-full h-11 flex items-center justify-center gap-2 text-sm font-bold text-white transition-opacity"
                  style={{
                    borderRadius: 10,
                    background: "var(--color-brand-primary)",
                    boxShadow: "0 4px 12px rgba(218,0,55,0.3)",
                    opacity: isLoading || !rUsername || !rEmail || !rFirstName || !rPassword || !rConfirm ? 0.6 : 1,
                  }}
                >
                  {isLoading ? "Mendaftar…" : (
                    <>Daftar <ArrowRight size={15} /></>
                  )}
                </button>

                <p className="text-center text-sm" style={{ color: "var(--color-muted-text)" }}>
                  Sudah punya akun?{" "}
                  <button type="button" onClick={() => switchMode("login")} className="font-semibold hover:underline" style={{ color: "var(--color-brand-primary)" }}>
                    Masuk
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
