# ChargeHub Auth Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the existing login page to the real FastAPI JWT auth endpoint, protect dashboard routes, and inject the bearer token into all API calls.

**Architecture:** JWT token stored in `localStorage` (for client-side API calls) and mirrored to a plain browser cookie `auth_token` (for Next.js middleware edge-side route protection). Auth store (Zustand) holds user state in memory. Middleware redirects unauthenticated requests to `/login` before they reach any `(dashboard)` route.

**Tech Stack:** Next.js 16.3.0, Zustand 5.0.14, FastAPI JWT (`/api/v1/auth/login` returns `{ accessToken, tokenType, user }`), `web/lib/api-client.ts` (existing fetch wrapper)

## Global Constraints

- Next.js 16.3.0 App Router — `middleware.ts` must live at `web/middleware.ts` (sibling to `app/`)
- Zustand 5.x — `create` from `"zustand"`, no `devtools` wrapper needed
- Token cookie name: `auth_token` (plain, JS-readable — NOT httpOnly; middleware reads it on edge)
- Cookie max-age: 3600s (1 hour, matches `ACCESS_TOKEN_EXPIRE_MINUTES=60`)
- `localStorage` key: `"ch_token"`
- API base: `process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"`
- Login endpoint: `POST /api/v1/auth/login` → body `{ email, password }` → response `{ accessToken, tokenType, user: { id, email, fullName, isActive } }`
- All `"use client"` files stay client-only; no SSR token reads

---

## File Map

| File | Status | Responsibility |
|------|--------|----------------|
| `web/lib/auth.ts` | **Create** | Token get/set/remove from localStorage + cookie |
| `web/stores/useAuthStore.ts` | **Create** | Zustand: user state, login(), logout() |
| `web/middleware.ts` | **Create** | Edge route guard: check `auth_token` cookie |
| `web/lib/api-client.ts` | **Modify** | Inject `Authorization: Bearer` on client-side requests |
| `web/app/(auth)/login/page.tsx` | **Modify** | Wire form → auth store login(), show error, loading |

---

### Task 1: Token helpers (`web/lib/auth.ts`)

**Files:**
- Create: `web/lib/auth.ts`

**Interfaces:**
- Produces:
  - `getToken(): string | null` — reads localStorage key `"ch_token"`
  - `setToken(token: string): void` — writes localStorage + sets `auth_token` cookie
  - `removeToken(): void` — clears both localStorage and cookie

- [ ] **Step 1: Create `web/lib/auth.ts`**

```typescript
const KEY = "ch_token";
const COOKIE = "auth_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(KEY, token);
  document.cookie = `${COOKIE}=${token}; path=/; max-age=3600; SameSite=Lax`;
}

export function removeToken(): void {
  localStorage.removeItem(KEY);
  document.cookie = `${COOKIE}=; path=/; max-age=0`;
}
```

- [ ] **Step 2: Verify file saved, no TypeScript errors**

Run: `npx tsc --noEmit` from `web/`
Expected: no errors related to `auth.ts`

---

### Task 2: Auth store (`web/stores/useAuthStore.ts`)

**Files:**
- Create: `web/stores/useAuthStore.ts`

**Interfaces:**
- Consumes: `setToken`, `removeToken` from `web/lib/auth.ts`; `api.post` from `web/lib/api-client.ts`
- Produces:
  - `useAuthStore()` returning `{ user, isLoading, error, login, logout }`
  - `login(email: string, password: string): Promise<void>` — calls API, stores token, sets user
  - `logout(): void` — clears token and user

```typescript
interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
}

interface AuthStore {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}
```

- [ ] **Step 1: Create `web/stores/useAuthStore.ts`**

```typescript
"use client";
import { create } from "zustand";
import { setToken, removeToken } from "@/lib/auth";

interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
}

interface AuthStore {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail ?? "Login failed");
      }
      const data = await res.json();
      setToken(data.accessToken);
      set({ user: data.user, isLoading: false, error: null });
    } catch (err) {
      set({ isLoading: false, error: (err as Error).message });
    }
  },

  logout: () => {
    removeToken();
    set({ user: null, error: null });
  },
}));
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: no errors

---

### Task 3: Inject auth header into `api-client.ts`

**Files:**
- Modify: `web/lib/api-client.ts`

**Interfaces:**
- Consumes: `getToken()` from `web/lib/auth.ts`
- No change to exported `api` object shape — callers unaffected

- [ ] **Step 1: Modify `web/lib/api-client.ts`**

Replace entire file with:

```typescript
import { getToken } from "./auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const authHeader: Record<string, string> = token
    ? { Authorization: `Bearer ${token}` }
    : {};
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
      ...init?.headers,
    },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: no errors

---

### Task 4: Wire login page (`web/app/(auth)/login/page.tsx`)

**Files:**
- Modify: `web/app/(auth)/login/page.tsx`

**Interfaces:**
- Consumes: `useAuthStore` from `web/stores/useAuthStore`; `useRouter` from `next/navigation`

Current login `Button onClick` just does `router.push("/dashboard")` — skip auth entirely. Replace with real login flow.

- [ ] **Step 1: Replace login page content**

Replace the entire file with:

```tsx
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
    // If login succeeded, error stays null — navigate to dashboard
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
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: no errors

---

### Task 5: Route protection middleware (`web/middleware.ts`)

**Files:**
- Create: `web/middleware.ts` (sibling to `web/app/`, i.e., `web/middleware.ts`)

**Interfaces:**
- Reads cookie: `auth_token` (set by `setToken()` in Task 1)
- No imports from project code — middleware runs on edge, must be self-contained

Logic:
- If request matches `/(dashboard)/...` AND cookie `auth_token` is missing → redirect to `/login`
- If request matches `/login` AND cookie `auth_token` exists → redirect to `/dashboard`
- Everything else: pass through

- [ ] **Step 1: Create `web/middleware.ts`**

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const { pathname } = request.nextUrl;

  const isDashboard = pathname.startsWith("/dashboard") ||
    pathname.startsWith("/vehicles") ||
    pathname.startsWith("/employees") ||
    pathname.startsWith("/activity") ||
    pathname.startsWith("/notifications");

  if (isDashboard && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/vehicles/:path*",
    "/employees/:path*",
    "/activity/:path*",
    "/notifications/:path*",
    "/login",
  ],
};
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: no errors

---

### Task 6: Wire logout in ProfilePopover

**Files:**
- Modify: `web/components/layout/ProfilePopover.tsx` (or wherever the logout button lives)

Profile avatar → popover → "Logout" button → must call `useAuthStore.getState().logout()` then `router.push("/login")`.

- [ ] **Step 1: Find the logout button in ProfilePopover**

```bash
grep -n "logout\|Logout\|signOut" web/components/layout/ProfilePopover.tsx
```

- [ ] **Step 2: Import auth store and add logout handler**

Add at top of file:
```tsx
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
```

Add inside component:
```tsx
const logout = useAuthStore((s) => s.logout);
const router = useRouter();

function handleLogout() {
  logout();
  router.push("/login");
}
```

Replace existing logout `onClick` with `onClick={handleLogout}`.

- [ ] **Step 3: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: no errors

---

## Self-Review

**Spec coverage:**
- ✅ Login form → real API call → Task 4
- ✅ Token storage (localStorage + cookie) → Task 1
- ✅ Auth store with error/loading state → Task 2
- ✅ API client injects Bearer token → Task 3
- ✅ Route protection → Task 5
- ✅ Logout → Task 6

**Placeholder scan:** None found. All steps have concrete code.

**Type consistency:**
- `getToken()` returns `string | null` — used in Task 3 with null-check ✅
- `useAuthStore` shape: `{ user, isLoading, error, login, logout }` — used consistently in Tasks 2, 4, 6 ✅
- Cookie name `auth_token` — set in Task 1, read in Task 5 ✅
- LocalStorage key `"ch_token"` — only touched in Task 1 ✅

**Known limitation:** `api-client.ts` uses `getToken()` which reads `localStorage`. Server components calling services directly (e.g., `dashboard/page.tsx`) will not have a token — this is OK because data endpoints (`/api/v1/vehicles`, etc.) do not require auth on the FastAPI side yet.
