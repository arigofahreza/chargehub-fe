import { ActivityLog, ActivityFilter } from "../types";
import { api } from "../api-client";

export async function getActivityLogs(
  filter?: ActivityFilter
): Promise<ActivityLog[]> {
  const params = new URLSearchParams();
  if (filter?.vehicleId && filter.vehicleId !== "all")
    params.set("vehicleId", filter.vehicleId);
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
