import { getToken } from "./auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const authHeader: Record<string, string> = token
    ? { Authorization: `Bearer ${token}` }
    : {};
  const hasBody = init?.body !== undefined;
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: {
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
      ...authHeader,
      ...init?.headers,
    },
    ...init,
  });
  if (!res.ok) {
    if (res.status === 401) {
      const { removeToken } = await import("./auth");
      const { useAuthStore } = await import("@/stores/useAuthStore");
      removeToken();
      useAuthStore.getState().logout();
      if (typeof window !== "undefined") window.location.href = "/login";
      return undefined as unknown as T;
    }
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text}`);
  }
  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return undefined as unknown as T;
  }
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  postForm: <T>(path: string, body: FormData) => {
    const token = getToken();
    const url = `${API_BASE}${path}`;
    return fetch(url, {
      method: "POST",
      body,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).then(async (res) => {
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`API ${res.status}: ${text}`);
      }
      return res.json() as Promise<T>;
    });
  },
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  patchForm: <T>(path: string, body: FormData) => {
    const token = getToken();
    const url = `${API_BASE}${path}`;
    return fetch(url, {
      method: "PATCH",
      body,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).then(async (res) => {
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`API ${res.status}: ${text}`);
      }
      return res.json() as Promise<T>;
    });
  },
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
