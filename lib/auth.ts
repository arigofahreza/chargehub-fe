const KEY = "ch_token";
const COOKIE = "auth_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KEY);
}

const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";

export function setToken(token: string): void {
  localStorage.setItem(KEY, token);
  document.cookie = `${COOKIE}=${token}; path=/; max-age=86400; SameSite=Lax${isSecure ? "; Secure" : ""}`;
}

export function removeToken(): void {
  localStorage.removeItem(KEY);
  document.cookie = `${COOKIE}=; path=/; max-age=0${isSecure ? "; Secure" : ""}`;
}
