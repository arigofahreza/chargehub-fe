import { NotificationTemplate } from "../types";

export const mockTemplates: NotificationTemplate[] = [
  {
    id: "1", name: "Low Battery Alert",
    message: "Hi {{name}}, your vehicle {{fleet_id}} battery is below 20%. Please charge immediately.",
    status: "active", employeeCount: 8, phoneCount: 8, lastSent: "2026-08-05T08:30:00Z", category: "Alert",
  },
  {
    id: "2", name: "Maintenance Due",
    message: "Hi {{name}}, vehicle {{fleet_id}} is due for scheduled maintenance on {{date}}. Please arrange accordingly.",
    status: "active", employeeCount: 3, phoneCount: 3, lastSent: "2026-08-04T10:00:00Z", category: "Maintenance",
  },
  {
    id: "3", name: "Route Assignment",
    message: "Hi {{name}}, you have been assigned route {{route_id}} starting at {{time}}. Vehicle: {{fleet_id}}.",
    status: "active", employeeCount: 10, phoneCount: 10, lastSent: "2026-08-06T06:00:00Z", category: "General",
  },
  {
    id: "4", name: "Vehicle Inspection Reminder",
    message: "Reminder: Vehicle {{fleet_id}} pre-trip inspection is required before departure today.",
    status: "inactive", employeeCount: 0, phoneCount: 0, lastSent: "2026-07-28T07:00:00Z", category: "Reminder",
  },
];
