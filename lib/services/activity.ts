import { ActivityLog, ActivityFilter } from "../types";
import { mockActivityLogs } from "../mock-data/activity";

export async function getActivityLogs(
  filter?: ActivityFilter
): Promise<ActivityLog[]> {
  let results = [...mockActivityLogs];
  if (filter?.serviceType && filter.serviceType !== "all") {
    results = results.filter((a) => a.serviceType === filter.serviceType);
  }
  if (filter?.vehicleId && filter.vehicleId !== "all") {
    results = results.filter((a) => a.vehicleId === filter.vehicleId);
  }
  return results;
}

export async function createActivityLog(
  data: Omit<ActivityLog, "id">
): Promise<ActivityLog> {
  const log: ActivityLog = { ...data, id: String(Date.now()) };
  mockActivityLogs.push(log);
  return log;
}

export async function updateActivityLog(
  id: string,
  data: Partial<ActivityLog>
): Promise<ActivityLog | null> {
  const idx = mockActivityLogs.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  mockActivityLogs[idx] = { ...mockActivityLogs[idx], ...data };
  return mockActivityLogs[idx];
}
