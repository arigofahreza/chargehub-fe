"use client";
import { create } from "zustand";
import { setToken, removeToken } from "@/lib/auth";

interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  role: "admin" | "operator";
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
