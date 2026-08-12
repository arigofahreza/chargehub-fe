import { Vehicle, VehicleFilter } from "../types";
import { api } from "../api-client";
import { getToken } from "../auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function getVehicles(filter?: VehicleFilter): Promise<Vehicle[]> {
  const params = new URLSearchParams();
  if (filter?.search) params.set("search", filter.search);
  if (filter?.status && filter.status !== "all") params.set("status", filter.status);
  const qs = params.toString();
  return api.get<Vehicle[]>(`/api/v1/vehicles${qs ? `?${qs}` : ""}`);
}

export async function getVehicleById(id: string): Promise<Vehicle | null> {
  try {
    return await api.get<Vehicle>(`/api/v1/vehicles/${id}`);
  } catch {
    return null;
  }
}

export async function createVehicle(data: Omit<Vehicle, "id">): Promise<Vehicle> {
  return api.post<Vehicle>("/api/v1/vehicles", data);
}

export async function updateVehicle(
  id: string,
  data: Partial<Vehicle>
): Promise<Vehicle | null> {
  try {
    return await api.patch<Vehicle>(`/api/v1/vehicles/${id}`, data);
  } catch {
    return null;
  }
}

export async function uploadVehiclePhoto(vehicleId: string, file: File): Promise<Vehicle> {
  const token = getToken();
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/api/v1/vehicles/${vehicleId}/photo`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Photo upload failed ${res.status}: ${text}`);
  }
  return res.json() as Promise<Vehicle>;
}
