"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  async function handleLogin() {
    await login(email, password);
    if (!useAuthStore.getState().error) {
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Hero */}
      <div className="relative h-[280px] lg:h-auto lg:flex-1">
        <Image
          src="/assets/login-hero.png"
          alt="ChargeHub Fleet"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0" style={{ backgroundColor: "rgba(11,28,48,0.4)" }} />
        <div className="lg:hidden absolute top-6 left-6">
          <Image
            src="/assets/logo-chargehub.png"
            alt="ChargeHub"
            width={120}
            height={28}
            className="object-contain"
          />
        </div>
        <div className="hidden lg:block absolute top-8 left-1/2 -translate-x-1/2">
          <div
            className="bg-white px-6 py-3"
            style={{ borderRadius: "9999px", boxShadow: "var(--shadow-logo)" }}
          >
            <Image
              src="/assets/logo-chargehub.png"
              alt="ChargeHub"
              width={160}
              height={36}
              className="object-contain"
            />
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="relative flex-1 lg:flex-none lg:w-[460px] bg-white flex items-center justify-center px-8 py-10 lg:py-12 -mt-7 lg:mt-0 rounded-t-[28px] lg:rounded-none">
        <div className="w-full max-w-sm space-y-6">
          <div>
            <h2
              className="text-2xl font-extrabold tracking-tight"
              style={{ color: "var(--color-ink)", letterSpacing: "-0.5px" }}
            >
              Welcome Back
            </h2>
            <p className="text-sm mt-1" style={{ color: "var(--color-muted-text)" }}>
              Let&apos;s login to manage your fleet.
            </p>
          </div>

          <div className="space-y-4">
            {/* Error message */}
            {error && (
              <div
                className="text-sm px-3 py-2 rounded-lg"
                style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}
              >
                {error}
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium" style={{ color: "var(--color-ink)" }}>
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--color-muted-text)" }} />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="pl-9"
                  style={{ borderRadius: "var(--radius-input)" }}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium" style={{ color: "var(--color-ink)" }}>
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--color-muted-text)" }} />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="pl-9 pr-10"
                  style={{ borderRadius: "var(--radius-input)" }}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "var(--color-muted-text)" }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={remember}
                  onCheckedChange={(v) => setRemember(v as boolean)}
                />
                <Label htmlFor="remember" className="text-sm cursor-pointer" style={{ color: "var(--color-body)" }}>
                  Remember me
                </Label>
              </div>
              <button
                type="button"
                className="text-sm font-medium hover:underline"
                style={{ color: "var(--color-brand-primary)" }}
              >
                Forgot?
              </button>
            </div>
          </div>

          <Button
            onClick={handleLogin}
            disabled={isLoading || !email || !password}
            className="w-full text-white font-bold h-11"
            style={{
              backgroundColor: "var(--color-brand-primary)",
              borderRadius: "var(--radius-btn)",
              boxShadow: "var(--shadow-btn)",
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? "Logging in…" : "Login"}
          </Button>

          <p className="text-center text-sm" style={{ color: "var(--color-muted-text)" }}>
            Don&apos;t have an account?{" "}
            <span
              className="font-semibold cursor-pointer hover:underline"
              style={{ color: "var(--color-brand-primary)" }}
            >
              Sign Up
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
