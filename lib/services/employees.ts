import { Employee, EmployeeStatus } from "../types";
import { api } from "../api-client";

export async function getJobTitles(): Promise<string[]> {
  return api.get<string[]>("/api/v1/job-titles");
}

export async function getEmployees(
  statusFilter?: EmployeeStatus | "all"
): Promise<Employee[]> {
  const params = new URLSearchParams();
  if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);
  const qs = params.toString();
  return api.get<Employee[]>(`/api/v1/employees${qs ? `?${qs}` : ""}`);
}

export async function createEmployee(
  data: Omit<Employee, "id">
): Promise<Employee> {
  return api.post<Employee>("/api/v1/employees", data);
}

export async function updateEmployee(
  id: string,
  data: Partial<Employee>
): Promise<Employee | null> {
  try {
    return await api.patch<Employee>(`/api/v1/employees/${id}`, data);
  } catch {
    return null;
  }
}

export async function deleteEmployee(id: string): Promise<boolean> {
  try {
    await api.delete(`/api/v1/employees/${id}`);
    return true;
  } catch {
    return false;
  }
}
