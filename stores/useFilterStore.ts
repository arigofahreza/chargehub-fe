import { create } from "zustand";
import { VehicleStatus, EmployeeStatus } from "@/lib/types";

interface VehicleFilterSlice {
  search: string;
  status: VehicleStatus | "all";
}

interface EmployeeFilterSlice {
  status: EmployeeStatus | "all";
}

interface ActivityFilterSlice {
  serviceType: string;
  vehicleId: string;
  dateFrom?: string;
  dateTo?: string;
}

interface FilterStore {
  vehicleFilter: VehicleFilterSlice;
  employeeFilter: EmployeeFilterSlice;
  activityFilter: ActivityFilterSlice;
  setVehicleFilter: (f: Partial<VehicleFilterSlice>) => void;
  setEmployeeFilter: (f: Partial<EmployeeFilterSlice>) => void;
  setActivityFilter: (f: Partial<ActivityFilterSlice>) => void;
  clearActivityFilters: () => void;
}

export const useFilterStore = create<FilterStore>((set) => ({
  vehicleFilter: { search: "", status: "all" },
  employeeFilter: { status: "all" },
  activityFilter: { serviceType: "all", vehicleId: "all" },

  setVehicleFilter: (f) =>
    set((s) => ({ vehicleFilter: { ...s.vehicleFilter, ...f } })),
  setEmployeeFilter: (f) =>
    set((s) => ({ employeeFilter: { ...s.employeeFilter, ...f } })),
  setActivityFilter: (f) =>
    set((s) => ({ activityFilter: { ...s.activityFilter, ...f } })),
  clearActivityFilters: () =>
    set({ activityFilter: { serviceType: "all", vehicleId: "all", dateFrom: undefined, dateTo: undefined } }),
}));
