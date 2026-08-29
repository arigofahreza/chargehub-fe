import { Vehicle, VehicleStatus } from "../types";

const statuses: VehicleStatus[] = ["idle", "idle", "working", "charging", "idle", "idle"];
const batteries = [87, 62, 95, 45, 78, 33];

export const mockVehicles: Vehicle[] = [
  // Wheel Loader SW9966 — unit 5901-01 to 5901-04
  {
    id: "1", name: "SW9966 - 5901-01", fleetId: "EV-001",
    make: "Sany", model: "SW9966", vin: "5901-01",
    batteryCapacity: 120, vehicleType: "Wheel Loader",
    status: statuses[0], batteryPercent: batteries[0],
    photoUrl: "/assets/vehicle-hero.jpg", operatingTime: 0, degradationRatePct: 2.0,
  },
  {
    id: "2", name: "SW9966 - 5901-02", fleetId: "EV-002",
    make: "Sany", model: "SW9966", vin: "5901-02",
    batteryCapacity: 120, vehicleType: "Wheel Loader",
    status: statuses[1], batteryPercent: batteries[1],
    photoUrl: "/assets/vehicle-hero.jpg", operatingTime: 0, degradationRatePct: 2.0,
  },
  {
    id: "3", name: "SW9966 - 5901-03", fleetId: "EV-003",
    make: "Sany", model: "SW9966", vin: "5901-03",
    batteryCapacity: 120, vehicleType: "Wheel Loader",
    status: statuses[2], batteryPercent: batteries[2],
    photoUrl: "/assets/vehicle-hero.jpg", operatingTime: 0, degradationRatePct: 2.0,
  },
  {
    id: "4", name: "SW9966 - 5901-04", fleetId: "EV-004",
    make: "Sany", model: "SW9966", vin: "5901-04",
    batteryCapacity: 120, vehicleType: "Wheel Loader",
    status: statuses[3], batteryPercent: batteries[3],
    photoUrl: "/assets/vehicle-hero.jpg", operatingTime: 0, degradationRatePct: 2.0,
  },
  // Ekskavator SY215C — unit 5201-01 to 5201-02
  {
    id: "5", name: "SY215C - 5201-01", fleetId: "EV-005",
    make: "Sany", model: "SY215C", vin: "5201-01",
    batteryCapacity: 100, vehicleType: "Ekskavator",
    status: statuses[4], batteryPercent: batteries[4],
    photoUrl: "/assets/vehicle-hero.jpg", operatingTime: 0, degradationRatePct: 2.0,
  },
  {
    id: "6", name: "SY215C - 5201-02", fleetId: "EV-006",
    make: "Sany", model: "SY215C", vin: "5201-02",
    batteryCapacity: 100, vehicleType: "Ekskavator",
    status: statuses[5], batteryPercent: batteries[5],
    photoUrl: "/assets/vehicle-hero.jpg", operatingTime: 0, degradationRatePct: 2.0,
  },
];
