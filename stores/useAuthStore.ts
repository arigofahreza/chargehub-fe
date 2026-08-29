"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { setToken, removeToken } from "@/lib/auth";

interface AuthUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  isActive: boolean;
  role: "admin" | "operator";
}

interface AuthStore {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, firstName: string, lastName: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function buildUser(raw: Record<string, unknown>): AuthUser {
  const firstName = (raw.firstName as string) ?? "";
  const lastName = (raw.lastName as string) ?? "";
  return {
    id: raw.id as string,
    username: raw.username as string,
    email: (raw.email as string) ?? "",
    firstName,
    lastName,
    fullName: (raw.fullName as string) ?? `${firstName} ${lastName}`.trim(),
    isActive: (raw.isActive as boolean) ?? true,
    role: (raw.role as "admin" | "operator") ?? "operator",
  };
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,

      login: async (username, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
          });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error((data as { detail?: string }).detail ?? "Login failed");
          }
          const data = await res.json();
          setToken(data.accessToken);
          set({ user: buildUser(data.user), isLoading: false, error: null });
        } catch (err) {
          set({ isLoading: false, error: (err as Error).message });
        }
      },

      register: async (username, email, firstName, lastName, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch(`${API_BASE}/api/v1/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, firstName, lastName, password }),
          });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            const raw = (data as { detail?: string | Array<{ msg: string }> }).detail;
            const message =
              typeof raw === "string"
                ? raw
                : Array.isArray(raw) && raw.length > 0
                  ? raw[0].msg.replace(/^Value error,\s*/i, "")
                  : "Pendaftaran gagal";
            throw new Error(message);
          }
          set({ isLoading: false, error: null });
          return true;
        } catch (err) {
          set({ isLoading: false, error: (err as Error).message });
          return false;
        }
      },

      logout: () => {
        removeToken();
        set({ user: null, error: null });
      },
    }),
    {
      name: "ch_auth",
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
