import { ActivityLog, ActivityFilter } from "../types";
import { api } from "../api-client";

export async function getSupervisors(): Promise<{ value: string; label: string }[]> {
  const employees = await api.get<{ id: string; name: string; jobTitle: string; status: string }[]>(
    "/api/v1/employees?jobTitle=Pengawas&status=active"
  );
  return employees.map((e) => ({ value: e.name, label: e.name }));
}

export async function getActivityLogs(
  filter?: ActivityFilter
): Promise<ActivityLog[]> {
  const params = new URLSearchParams();
  if (filter?.vehicleId && filter.vehicleId !== "all")
    params.set("vehicleId", filter.vehicleId);
  if (filter?.dateFrom) params.set("dateFrom", filter.dateFrom);
  if (filter?.dateTo) params.set("dateTo", filter.dateTo);
  const qs = params.toString();
  const logs = await api.get<ActivityLog[]>(`/api/v1/activities${qs ? `?${qs}` : ""}`);
  if (filter?.serviceType && filter.serviceType !== "all") {
    return logs.filter((a) => a.serviceType === filter.serviceType);
  }
  return logs;
}

export async function createActivityLog(
  data: Omit<ActivityLog, "id">
): Promise<ActivityLog> {
  return api.post<ActivityLog>("/api/v1/activities", data);
}

export async function updateActivityLog(
  id: string,
  data: Partial<ActivityLog>
): Promise<ActivityLog | null> {
  try {
    return await api.patch<ActivityLog>(`/api/v1/activities/${id}`, data);
  } catch {
    return null;
  }
}

export async function deleteActivityLog(id: string): Promise<boolean> {
  try {
    await api.delete(`/api/v1/activities/${id}`);
    return true;
  } catch {
    return false;
  }
}

export async function getAvgDuration(
  vehicleId: string,
  serviceType: string
): Promise<number | null> {
  try {
    const params = new URLSearchParams({ vehicleId, serviceType });
    const result = await api.get<{ avgDurationMinutes: number | null }>(
      `/api/v1/activities/avg-duration?${params}`
    );
    return result.avgDurationMinutes;
  } catch {
    return null;
  }
}
