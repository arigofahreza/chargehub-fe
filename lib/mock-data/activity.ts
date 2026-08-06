import { ActivityLog } from "../types";

export const mockActivityLogs: ActivityLog[] = [
  { id: "1", dateTime: "2026-08-06T09:15:00Z", vehicleId: "1", vehicleName: "Tesla Model Y", unitId: "EV-001", serviceType: "Charging", driver: "James Wilson", status: "completed", createdBy: "System" },
  { id: "2", dateTime: "2026-08-06T08:00:00Z", vehicleId: "4", vehicleName: "Hyundai IONIQ 5", unitId: "EV-004", serviceType: "Maintenance", driver: "Unassigned", status: "in-progress", createdBy: "Anna Kowalski" },
  { id: "3", dateTime: "2026-08-05T14:30:00Z", vehicleId: "2", vehicleName: "BYD Atto 3", unitId: "EV-002", serviceType: "Inspection", driver: "Sarah Chen", status: "completed", createdBy: "James Wilson" },
  { id: "4", dateTime: "2026-08-05T11:00:00Z", vehicleId: "3", vehicleName: "NIO ET5", unitId: "EV-003", serviceType: "Charging", driver: "Mike Rodriguez", status: "completed", createdBy: "System" },
  { id: "5", dateTime: "2026-08-05T09:45:00Z", vehicleId: "5", vehicleName: "Chery Omoda E5", unitId: "EV-005", serviceType: "Tire Rotation", driver: "Lisa Park", status: "pending", createdBy: "Anna Kowalski" },
  { id: "6", dateTime: "2026-08-04T16:00:00Z", vehicleId: "6", vehicleName: "MG4 Electric", unitId: "EV-006", serviceType: "Charging", driver: "Tom Baker", status: "completed", createdBy: "System" },
  { id: "7", dateTime: "2026-08-04T13:30:00Z", vehicleId: "1", vehicleName: "Tesla Model Y", unitId: "EV-001", serviceType: "Inspection", driver: "James Wilson", status: "completed", createdBy: "James Wilson" },
  { id: "8", dateTime: "2026-08-03T10:00:00Z", vehicleId: "4", vehicleName: "Hyundai IONIQ 5", unitId: "EV-004", serviceType: "Battery Check", driver: "Unassigned", status: "in-progress", createdBy: "Anna Kowalski" },
  { id: "9", dateTime: "2026-08-03T08:30:00Z", vehicleId: "2", vehicleName: "BYD Atto 3", unitId: "EV-002", serviceType: "Charging", driver: "Sarah Chen", status: "completed", createdBy: "System" },
  { id: "10", dateTime: "2026-08-02T15:00:00Z", vehicleId: "3", vehicleName: "NIO ET5", unitId: "EV-003", serviceType: "Maintenance", driver: "Mike Rodriguez", status: "completed", createdBy: "James Wilson" },
];
