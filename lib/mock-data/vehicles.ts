import { Vehicle, VehicleStatus } from "../types";

export const mockVehicles: Vehicle[] = [
  {
    id: "1", name: "Tesla Model Y", fleetId: "EV-001", make: "Tesla", model: "Model Y",
    year: 2023, vin: "5YJYGDEE4MF123456", batteryCapacity: 75, maxRange: 533,
    assignedDriver: "James Wilson", status: "available", batteryPercent: 87,
    photoUrl: "/assets/vehicle-hero.jpg", temperature: 24, voltage: 394, range: 463,
  },
  {
    id: "2", name: "BYD Atto 3", fleetId: "EV-002", make: "BYD", model: "Atto 3",
    year: 2023, vin: "LGXCE4C09P1234567", batteryCapacity: 60, maxRange: 420,
    assignedDriver: "Sarah Chen", status: "in-use", batteryPercent: 62,
    photoUrl: "/assets/vehicle-2.jpg", temperature: 26, voltage: 380, range: 260,
  },
  {
    id: "3", name: "NIO ET5", fleetId: "EV-003", make: "NIO", model: "ET5",
    year: 2022, vin: "NIO0ET5S2022A3456", batteryCapacity: 75, maxRange: 560,
    assignedDriver: "Mike Rodriguez", status: "available", batteryPercent: 95,
    photoUrl: "/assets/vehicle-3.jpg", temperature: 23, voltage: 396, range: 532,
  },
  {
    id: "4", name: "Hyundai IONIQ 5", fleetId: "EV-004", make: "Hyundai", model: "IONIQ 5",
    year: 2023, vin: "KMHK341GX2A234567", batteryCapacity: 72, maxRange: 481,
    assignedDriver: "Unassigned", status: "service", batteryPercent: 45,
    photoUrl: "/assets/vehicle-4.jpg", temperature: 28, voltage: 370, range: 216,
  },
  {
    id: "5", name: "Chery Omoda E5", fleetId: "EV-005", make: "Chery", model: "Omoda E5",
    year: 2024, vin: "LSVSDC0B3RA234567", batteryCapacity: 61, maxRange: 430,
    assignedDriver: "Lisa Park", status: "available", batteryPercent: 78,
    photoUrl: "/assets/vehicle-5.jpg", temperature: 25, voltage: 385, range: 335,
  },
  {
    id: "6", name: "MG4 Electric", fleetId: "EV-006", make: "MG", model: "MG4",
    year: 2023, vin: "SDPBF4B37PA234567", batteryCapacity: 64, maxRange: 450,
    assignedDriver: "Tom Baker", status: "in-use", batteryPercent: 33,
    photoUrl: "/assets/vehicle-6.jpg", temperature: 27, voltage: 365, range: 148,
  },
  ...Array.from({ length: 72 }, (_, i): Vehicle => ({
    id: String(i + 7),
    name: `Fleet Vehicle ${i + 7}`,
    fleetId: `EV-${String(i + 7).padStart(3, "0")}`,
    make: ["Tesla", "BYD", "NIO", "Hyundai", "Chery", "MG"][i % 6],
    model: ["Model Y", "Atto 3", "ET5", "IONIQ 5", "Omoda E5", "MG4"][i % 6],
    year: 2022 + (i % 3),
    vin: `VIN${String(i + 7).padStart(13, "0")}`,
    batteryCapacity: [60, 72, 75, 64, 61, 75][i % 6],
    maxRange: [420, 481, 560, 450, 430, 533][i % 6],
    assignedDriver: i % 4 === 3 ? "Unassigned" : `Driver ${i + 7}`,
    status: (["available", "available", "in-use", "service"] as VehicleStatus[])[i % 4],
    batteryPercent: 20 + (i * 7) % 80,
    photoUrl: "/assets/vehicle-hero.jpg",
    temperature: 22 + (i % 8),
    voltage: 360 + (i % 40),
    range: 100 + (i * 13) % 400,
  })),
];
