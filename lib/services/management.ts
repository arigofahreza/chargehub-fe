import { api } from "@/lib/api-client";

export interface AdminUser {
  id: string;
  username: string;
  fullName: string;
  isActive: boolean;
  role: string;
  roleCategoryId: string | null;
}

export interface Category {
  id: string;
  name: string;
}

export interface EmployeeCategory {
  id: string;
  name: string;
  role: string | null;
}

export interface ActivityCategory {
  id: string;
  name: string;
  icon_url: string | null;
}

export interface RegisterUserInput {
  username: string;
  phone: string;
  firstName: string;
  lastName: string;
  password: string;
  jabatan?: string;
}

export async function registerUser(input: RegisterUserInput): Promise<AdminUser> {
  return api.post<AdminUser>("/api/v1/auth/register", input);
}

export async function getUsers(): Promise<AdminUser[]> {
  return api.get<AdminUser[]>("/api/v1/users");
}

export async function patchUserRole(userId: string, roleCategoryId: string): Promise<AdminUser> {
  return api.patch<AdminUser>(`/api/v1/users/${userId}/role`, { roleCategoryId });
}

export async function deleteUser(userId: string): Promise<boolean> {
  try {
    await api.delete(`/api/v1/users/${userId}`);
    return true;
  } catch {
    return false;
  }
}

export async function getVehicleCategories(): Promise<Category[]> {
  return api.get<Category[]>("/api/v1/categories/vehicle");
}

export async function createVehicleCategory(name: string): Promise<Category> {
  return api.post<Category>("/api/v1/categories/vehicle", { name });
}

export async function updateVehicleCategory(id: string, name: string): Promise<Category> {
  return api.patch<Category>(`/api/v1/categories/vehicle/${id}`, { name });
}

export async function deleteVehicleCategory(id: string): Promise<boolean> {
  try {
    await api.delete(`/api/v1/categories/vehicle/${id}`);
    return true;
  } catch {
    return false;
  }
}

export async function getEmployeeCategories(): Promise<EmployeeCategory[]> {
  return api.get<EmployeeCategory[]>("/api/v1/categories/employee");
}

export async function createEmployeeCategory(name: string): Promise<EmployeeCategory> {
  return api.post<EmployeeCategory>("/api/v1/categories/employee", { name });
}

export async function updateEmployeeCategory(id: string, name: string): Promise<EmployeeCategory> {
  return api.patch<EmployeeCategory>(`/api/v1/categories/employee/${id}`, { name });
}

export async function deleteEmployeeCategory(id: string): Promise<boolean> {
  try {
    await api.delete(`/api/v1/categories/employee/${id}`);
    return true;
  } catch {
    return false;
  }
}

export async function getActivityCategories(): Promise<ActivityCategory[]> {
  return api.get<ActivityCategory[]>("/api/v1/categories/activity");
}

export async function createActivityCategory(name: string, iconFile: File): Promise<ActivityCategory> {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("icon", iconFile);
  return api.postForm<ActivityCategory>("/api/v1/categories/activity", formData);
}

export async function updateActivityCategory(id: string, name: string, iconFile?: File): Promise<ActivityCategory> {
  const formData = new FormData();
  formData.append("name", name);
  if (iconFile) formData.append("icon", iconFile);
  return api.patchForm<ActivityCategory>(`/api/v1/categories/activity/${id}`, formData);
}

export async function deleteActivityCategory(id: string): Promise<boolean> {
  try {
    await api.delete(`/api/v1/categories/activity/${id}`);
    return true;
  } catch {
    return false;
  }
}

export interface BatteryDrainRate {
  id: string;
  activityId: string;
  activityName: string;
  persenPenurunan: number;
}

export async function getBatteryDrainRates(): Promise<BatteryDrainRate[]> {
  return api.get<BatteryDrainRate[]>("/api/v1/categories/battery-drain-rates");
}

export async function createBatteryDrainRate(activityId: string, persenPenurunan: number): Promise<BatteryDrainRate> {
  return api.post<BatteryDrainRate>("/api/v1/categories/battery-drain-rates", { activityId, persenPenurunan });
}

export async function updateBatteryDrainRate(id: string, persenPenurunan: number): Promise<BatteryDrainRate> {
  return api.patch<BatteryDrainRate>(`/api/v1/categories/battery-drain-rates/${id}`, { persenPenurunan });
}

export async function deleteBatteryDrainRate(id: string): Promise<boolean> {
  try {
    await api.delete(`/api/v1/categories/battery-drain-rates/${id}`);
    return true;
  } catch {
    return false;
  }
}

export interface EmployeeTokenInfo {
  id: string;
  name: string;
  phone: string;
  subscribed: boolean;
  chatId: string | null;
  subscribeToken: string | null;
}

export async function getEmployeeTokens(): Promise<EmployeeTokenInfo[]> {
  return api.get<EmployeeTokenInfo[]>("/api/v1/employees/telegram-tokens");
}

export async function refreshEmployeeToken(employeeId: string): Promise<EmployeeTokenInfo> {
  return api.post<EmployeeTokenInfo>(`/api/v1/employees/${employeeId}/refresh-token`, {});
}
