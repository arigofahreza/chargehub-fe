import { Vehicle, VehicleFilter } from "../types";
import { mockVehicles } from "../mock-data/vehicles";

export async function getVehicles(filter?: VehicleFilter): Promise<Vehicle[]> {
  let results = [...mockVehicles];
  if (filter?.search) {
    const q = filter.search.toLowerCase();
    results = results.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.fleetId.toLowerCase().includes(q)
    );
  }
  if (filter?.status && filter.status !== "all") {
    results = results.filter((v) => v.status === filter.status);
  }
  return results;
}

export async function getVehicleById(id: string): Promise<Vehicle | null> {
  return mockVehicles.find((v) => v.id === id) ?? null;
}

export async function createVehicle(data: Omit<Vehicle, "id">): Promise<Vehicle> {
  const newVehicle: Vehicle = { ...data, id: String(Date.now()) };
  mockVehicles.push(newVehicle);
  return newVehicle;
}

export async function updateVehicle(
  id: string,
  data: Partial<Vehicle>
): Promise<Vehicle | null> {
  const idx = mockVehicles.findIndex((v) => v.id === id);
  if (idx === -1) return null;
  mockVehicles[idx] = { ...mockVehicles[idx], ...data };
  return mockVehicles[idx];
}
