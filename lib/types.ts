export type VehicleStatus = "available" | "in-use" | "service";
export type EmployeeStatus = "active" | "on-leave" | "inactive";
export type TemplateStatus = "active" | "inactive";
export type ActivityStatus = "completed" | "in-progress" | "pending";

export interface Vehicle {
  id: string;
  name: string;
  fleetId: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  batteryCapacity: number;
  maxRange: number;
  assignedDriver: string;
  status: VehicleStatus;
  batteryPercent: number;
  photoUrl: string;
  temperature: number;
  voltage: number;
  range: number;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  jobTitle: string;
  phone: string;
  status: EmployeeStatus;
  avatarUrl?: string;
  initials: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  message: string;
  status: TemplateStatus;
  employeeCount: number;
  phoneCount: number;
  lastSent: string;
}

export interface ActivityLog {
  id: string;
  dateTime: string;
  vehicleId: string;
  vehicleName: string;
  unitId: string;
  serviceType: string;
  driver: string;
  status: ActivityStatus;
  createdBy: string;
}

export interface VehicleFilter {
  search?: string;
  status?: VehicleStatus | "all";
}

export interface ActivityFilter {
  serviceType?: string;
  vehicleId?: string;
}
