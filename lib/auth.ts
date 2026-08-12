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
