"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, User, Lock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";

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
  const { login, isLoading, error } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  async function handleLogin() {
    await login(username, password);
    if (!useAuthStore.getState().error) router.push("/dashboard");
  }

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex">
      {/* Left panel: image */}
      <div
        className="hidden lg:flex flex-col items-center justify-center flex-1 relative overflow-hidden"
        style={{ background: "#EBEBEB" }}
      >
        <div className="relative w-[100%] h-[100%]">
          <Image src="/assets/login-hero.jpg" alt="Fleet" fill priority className="object-contain" />
        </div>
      </div>

      {/* Right panel: login form */}
      <div
        className="flex flex-col items-center justify-center w-full lg:w-[480px] px-8 py-12 overflow-y-auto"
        style={{ background: "#FFFFFF", minHeight: "100dvh" }}
      >
        <div className="w-full max-w-sm space-y-7">
          {/* Logo */}
          <div className="flex flex-col items-center gap-2 pb-1">
            <Image src="/assets/amm.png" alt="AMEV" width={48} height={48} className="object-contain" style={{ width: 48, height: "auto" }} />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: "var(--color-ink)", letterSpacing: "-0.5px", lineHeight: 1.1 }}>AMEV</span>
              <span style={{ fontSize: 10, fontWeight: 500, color: "var(--color-muted-text)", letterSpacing: "0.4px" }}>Antareja Monitoring EV</span>
            </div>
          </div>

          {/* Header */}
          <div>
            <h2 className="text-2xl font-extrabold" style={{ color: "var(--color-ink)", letterSpacing: "-0.5px" }}>
              Selamat Datang!
            </h2>
            <p className="text-sm mt-1" style={{ color: "var(--color-muted-text)" }}>
              Masuk untuk mengelola armada Anda.
            </p>
          </div>

          {error && (
            <div className="text-sm px-4 py-3 rounded-xl flex items-start gap-2.5" style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}>
              <span className="mt-0.5 flex-shrink-0">⚠</span>
              {error}
            </div>
          )}

          <div className="space-y-4">
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
          </div>
        </div>
      </div>
    </div>
  );
}
