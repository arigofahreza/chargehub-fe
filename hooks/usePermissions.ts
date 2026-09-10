"use client";
import { useAuthStore } from "@/stores/useAuthStore";
import { getPermissions, type Permissions, type AppRole } from "@/lib/rbac";

export function usePermissions(): Permissions {
  const role = useAuthStore((s) => s.user?.role) as AppRole | undefined;
  return getPermissions(role);
}
