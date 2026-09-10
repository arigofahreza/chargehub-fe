export type AppRole = "admin" | "pengawas" | "operator" | "spotter";

export interface Permissions {
  canAccessManagement: boolean;
  canWriteEmployees: boolean;
  canWriteVehicles: boolean;
  canWriteNotifications: boolean;
  canWriteActivity: boolean;
  /** null = all service types allowed */
  allowedServiceTypes: string[] | null;
}

const CHARGING_TYPES = ["Charging"];
const STACKING_TYPES = ["Heavy Stacking", "Light Stacking"];

const ROLE_PERMISSIONS: Record<AppRole, Permissions> = {
  admin: {
    canAccessManagement: true,
    canWriteEmployees: true,
    canWriteVehicles: true,
    canWriteNotifications: true,
    canWriteActivity: true,
    allowedServiceTypes: null,
  },
  pengawas: {
    canAccessManagement: false,
    canWriteEmployees: true,
    canWriteVehicles: true,
    canWriteNotifications: true,
    canWriteActivity: true,
    allowedServiceTypes: null,
  },
  operator: {
    canAccessManagement: false,
    canWriteEmployees: false,
    canWriteVehicles: false,
    canWriteNotifications: false,
    canWriteActivity: true,
    allowedServiceTypes: CHARGING_TYPES,
  },
  spotter: {
    canAccessManagement: false,
    canWriteEmployees: false,
    canWriteVehicles: false,
    canWriteNotifications: false,
    canWriteActivity: true,
    allowedServiceTypes: STACKING_TYPES,
  },
};

export function getPermissions(role: AppRole | undefined | null): Permissions {
  if (!role || !(role in ROLE_PERMISSIONS)) return ROLE_PERMISSIONS.operator;
  return ROLE_PERMISSIONS[role];
}

export function getRoleLabel(role: AppRole | string | undefined): string {
  const labels: Record<string, string> = {
    admin: "Admin",
    pengawas: "Pengawas",
    operator: "Operator",
    spotter: "Spotter",
  };
  return labels[role ?? ""] ?? role ?? "-";
}
