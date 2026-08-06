"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  return (
    <div className="min-h-screen flex">
      {/* Hero — left half */}
      <div className="hidden lg:block relative flex-1">
        <Image
          src="/assets/login-hero.png"
          alt="ChargeHub Fleet"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0" style={{ backgroundColor: "rgba(11,28,48,0.4)" }} />
        {/* Logo badge */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2">
          <div
            className="bg-white px-6 py-3"
            style={{
              borderRadius: "9999px",
              boxShadow: "var(--shadow-logo)",
            }}
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

      {/* Form panel — right */}
      <div className="w-full lg:w-[460px] flex items-center justify-center bg-white px-8 py-12">
        <div className="w-full max-w-sm space-y-6">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-4">
            <div
              className="bg-white px-6 py-3"
              style={{
                borderRadius: "9999px",
                boxShadow: "var(--shadow-logo)",
                border: "1px solid var(--color-border-ch)",
              }}
            >
              <Image
                src="/assets/logo-chargehub.png"
                alt="ChargeHub"
                width={140}
                height={32}
                className="object-contain"
              />
            </div>
          </div>

          <div>
            <h2
              className="text-2xl font-extrabold tracking-tight"
              style={{
                color: "var(--color-ink)",
                letterSpacing: "-0.5px",
              }}
            >
              Welcome Back
            </h2>
            <p className="text-sm mt-1" style={{ color: "var(--color-muted-text)" }}>
              Let&apos;s login to manage your fleet.
            </p>
          </div>

          <div className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-sm font-medium"
                style={{ color: "var(--color-ink)" }}
              >
                Email
              </Label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                  style={{ color: "var(--color-muted-text)" }}
                />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  style={{ borderRadius: "var(--radius-input)" }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="text-sm font-medium"
                style={{ color: "var(--color-ink)" }}
              >
                Password
              </Label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                  style={{ color: "var(--color-muted-text)" }}
                />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-10"
                  style={{ borderRadius: "var(--radius-input)" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "var(--color-muted-text)" }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
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
                <Label
                  htmlFor="remember"
                  className="text-sm cursor-pointer"
                  style={{ color: "var(--color-body)" }}
                >
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
            onClick={() => router.push("/dashboard")}
            className="w-full text-white font-bold h-11"
            style={{
              backgroundColor: "var(--color-brand-primary)",
              borderRadius: "var(--radius-btn)",
              boxShadow: "var(--shadow-btn)",
            }}
          >
            Login
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
