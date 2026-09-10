export type VehicleStatus = "idle" | "working" | "charging";
export type EmployeeStatus = "active" | "on-leave" | "inactive";
export type TemplateStatus = "active" | "inactive";
export type ActivityStatus = "completed" | "in-progress" | "pending";

export interface Vehicle {
  id: string;
  name: string;
  fleetId: string;
  make: string;
  model: string;
  vin: string;
  batteryCapacity: number;
  status: VehicleStatus;
  batteryPercent: number;
  photoUrl: string;
  operatingTime: number;
  degradationRatePct: number;
  vehicleType: string;
}

export interface Employee {
  id: string;
  name: string;
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
  category: string;
}

export interface ActivityLog {
  id: string;
  dateTime: string;
  vehicleId: string;
  vehicleName: string;
  unitId: string;
  serviceType: string;
  supervisor?: string;
  driver: string;
  status: ActivityStatus;
  createdBy: string;
  durationMinutes?: number;
  energyKwh?: number;
}

export interface VehicleFilter {
  search?: string;
  status?: VehicleStatus | "all";
}

export interface ActivityFilter {
  serviceType?: string;
  vehicleId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface DashboardFilter {
  vehicleId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface FleetStatusData {
  available: number;
  inUse: number;
  service: number;
  total: number;
}

export interface UsageTrendPoint {
  date: string;
  km: number;
}

export interface TopEnergyItem {
  vehicleId: string;
  vehicleName: string;
  totalKwh: number;
  pct: number;
}

export interface DashboardStats {
  totalKm: number;
  totalKwh: number;
  activityCount: number;
  availableCount: number;
  avgBatteryPct: number;
  totalVehicles: number;
}

export interface BatteryHourlyData {
  vehicles: string[];
  data: Array<{ hour: number; [vehicle: string]: number }>;
}

export interface AvgKwhItem {
  vehicleId: string;
  vehicleName: string;
  avgKwh: number;
  estimatedCost: number;
  sessionCount: number;
}
