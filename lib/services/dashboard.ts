import { api } from "../api-client";
import {
  DashboardFilter,
  FleetStatusData,
  UsageTrendPoint,
  TopEnergyItem,
  DashboardStats,
} from "../types";

function buildQs(filter?: DashboardFilter): string {
  const params = new URLSearchParams();
  if (filter?.vehicleId && filter.vehicleId !== "all")
    params.set("vehicleId", filter.vehicleId);
  if (filter?.dateFrom) params.set("dateFrom", filter.dateFrom);
  if (filter?.dateTo) params.set("dateTo", filter.dateTo);
  const s = params.toString();
  return s ? `?${s}` : "";
}

export function getFleetStatus(filter?: DashboardFilter): Promise<FleetStatusData> {
  return api.get<FleetStatusData>(`/api/v1/dashboard/fleet-status${buildQs(filter)}`);
}

export function getUsageTrend(filter?: DashboardFilter): Promise<UsageTrendPoint[]> {
  return api.get<UsageTrendPoint[]>(`/api/v1/dashboard/usage-trend${buildQs(filter)}`);
}

export function getTopEnergy(filter?: DashboardFilter, limit = 5): Promise<TopEnergyItem[]> {
  const qs = new URLSearchParams();
  if (filter?.vehicleId && filter.vehicleId !== "all")
    qs.set("vehicleId", filter.vehicleId);
  if (filter?.dateFrom) qs.set("dateFrom", filter.dateFrom);
  if (filter?.dateTo) qs.set("dateTo", filter.dateTo);
  qs.set("limit", String(limit));
  return api.get<TopEnergyItem[]>(`/api/v1/dashboard/top-energy?${qs.toString()}`);
}

export function getDashboardStats(filter?: DashboardFilter): Promise<DashboardStats> {
  return api.get<DashboardStats>(`/api/v1/dashboard/stats${buildQs(filter)}`);
}
