"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { EmployeeTable } from "@/components/employees/EmployeeTable";
import { EmployeeFormModal } from "@/components/employees/EmployeeFormModal";
import { getEmployees, createEmployee, updateEmployee } from "@/lib/services/employees";
import { Employee, EmployeeStatus } from "@/lib/types";
import { Wave } from "@/components/ui/wave";
import { useAuthStore } from "@/stores/useAuthStore";

const statusChips: { label: string; value: EmployeeStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "On Leave", value: "on-leave" },
  { label: "Inactive", value: "inactive" },
];

export default function EmployeesPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (user && user.role !== "admin") router.replace("/dashboard");
  }, [user, router]);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [statusFilter, setStatusFilter] = useState<EmployeeStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getEmployees(statusFilter).then((data) => {
      setEmployees(data);
      setLoading(false);
    });
  }, [statusFilter]);

  const filtered = employees.filter((e) =>
    search === "" || e.name.toLowerCase().includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase())
  );

  async function handleSubmit(data: Partial<Employee>) {
    if (editing) {
      const updated = await updateEmployee(editing.id, data);
      if (updated) setEmployees((prev) => prev.map((e) => (e.id === editing.id ? updated : e)));
    } else {
      const created = await createEmployee(data as Omit<Employee, "id">);
      setEmployees((prev) => [created, ...prev]);
    }
  }

  function handleEdit(emp: Employee) {
    setEditing(emp);
    setModalOpen(true);
  }

  function handleDelete(id: string) {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  }

  function handleAdd() {
    setEditing(null);
    setModalOpen(true);
  }

  if (user?.role !== "admin") return null;

  return (
    <>
      <TopBar />
      <main className="p-4 md:p-6 space-y-5">
        {/* Title row */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 style={{ fontWeight: 700, fontSize: 22, color: "#0B1C30", letterSpacing: "-0.4px" }}>Employees</h1>
            <p style={{ fontSize: 13, color: "#434655" }}>Manage fleet personnel.</p>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-1.5 flex-shrink-0"
            style={{ background: "#004AC6", border: "none", borderRadius: 10, color: "#fff", fontSize: 11, fontWeight: 600, padding: "9px 14px", fontFamily: "inherit", cursor: "pointer" }}
          >
            <span style={{ fontSize: 14, lineHeight: 1 }}>+</span>
            Add
          </button>
        </div>

        {/* Filter card: search + status chips */}
        <div
          style={{
            background: "#fff",
            border: "1px solid rgba(195,198,215,0.5)",
            borderRadius: 14,
            padding: 14,
            display: "flex",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
            <input
              type="text"
              placeholder="Search employees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                height: 42,
                borderRadius: 10,
                background: "#EFF4FF",
                border: "1px solid rgba(195,198,215,0.5)",
                padding: "0 14px 0 36px",
                fontSize: 14,
                color: "#0B1C30",
                fontFamily: "inherit",
                outline: "none",
              }}
            />
            <svg
              width="15"
              height="15"
              viewBox="0 0 18 18"
              fill="none"
              style={{ position: "absolute", left: 11, top: 13, pointerEvents: "none" }}
            >
              <circle cx="7" cy="7" r="6" stroke="#737686" strokeWidth="2" />
              <line x1="12" y1="12" x2="17" y2="17" stroke="#737686" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex gap-2 flex-wrap">
            {statusChips.map((c) => {
              const active = statusFilter === c.value;
              return (
                <button
                  key={c.value}
                  onClick={() => setStatusFilter(c.value)}
                  className="text-xs font-semibold px-3 py-1.5 transition-colors flex-shrink-0"
                  style={{
                    borderRadius: "9999px",
                    backgroundColor: active ? "var(--color-brand-primary)" : "#EFF4FF",
                    color: active ? "white" : "var(--color-body)",
                    border: `1px solid ${active ? "var(--color-brand-primary)" : "rgba(195,198,215,0.5)"}`,
                  }}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Wave className="size-16 text-[#004AC6]" />
            <p className="text-sm" style={{ color: "var(--color-muted-text)" }}>Loading employees...</p>
          </div>
        ) : (
          <>
            <p className="text-xs" style={{ color: "var(--color-muted-text)" }}>
              {filtered.length} employee{filtered.length !== 1 ? "s" : ""}
            </p>
            <EmployeeTable employees={filtered} onEdit={handleEdit} onDelete={handleDelete} />
            <span className="md:hidden block text-center text-xs" style={{ color: "#9CA3AF" }}>← swipe table to see more →</span>
          </>
        )}
      </main>

      <EmployeeFormModal
        open={modalOpen}
        onOpenChange={(o) => {
          setModalOpen(o);
          if (!o) setEditing(null);
        }}
        initial={editing ?? undefined}
        mode={editing ? "edit" : "add"}
        onSubmit={handleSubmit}
      />
    </>
  );
}
