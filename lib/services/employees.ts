import { Employee, EmployeeStatus } from "../types";
import { mockEmployees } from "../mock-data/employees";

export async function getEmployees(
  statusFilter?: EmployeeStatus | "all"
): Promise<Employee[]> {
  if (!statusFilter || statusFilter === "all") return [...mockEmployees];
  return mockEmployees.filter((e) => e.status === statusFilter);
}

export async function createEmployee(
  data: Omit<Employee, "id">
): Promise<Employee> {
  const newEmp: Employee = { ...data, id: String(Date.now()) };
  mockEmployees.push(newEmp);
  return newEmp;
}

export async function updateEmployee(
  id: string,
  data: Partial<Employee>
): Promise<Employee | null> {
  const idx = mockEmployees.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  mockEmployees[idx] = { ...mockEmployees[idx], ...data };
  return mockEmployees[idx];
}
