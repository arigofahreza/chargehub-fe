"use client";
import { useState } from "react";
import { Employee, EmployeeStatus } from "@/lib/types";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";

const statusConfig: Record<EmployeeStatus, { label: string; bg: string; text: string }> = {
  active: { label: "Aktif", bg: "rgba(0,113,77,0.1)", text: "#00714D" },
  "on-leave": { label: "Cuti", bg: "rgba(122,62,0,0.1)", text: "#7A3E00" },
  inactive: { label: "Tidak Aktif", bg: "rgba(68,68,68,0.1)", text: "#444444" },
};

function Avatar({ employee }: { employee: Employee }) {
  if (employee.avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={employee.avatarUrl} alt={employee.name} className="w-8 h-8 rounded-full object-cover" />;
  }
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
      style={{ backgroundColor: "var(--color-brand-primary)" }}
    >
      {employee.initials}
    </div>
  );
}

interface Props {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onDelete: (id: string) => void;
  canWrite?: boolean;
}

export function EmployeeTable({ employees, onEdit, onDelete, canWrite }: Props) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const pendingEmp = employees.find((e) => e.id === pendingId);

  if (employees.length === 0) {
    return (
      <div className="text-center py-16 text-sm" style={{ color: "var(--color-muted-text)" }}>
        Tidak ada karyawan ditemukan.
      </div>
    );
  }

  return (
    <>
      <div style={{ overflowX: "auto", borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-card)", background: "#fff" }}>
        <table className="text-sm" style={{ borderCollapse: "collapse", minWidth: 640, width: "100%" }}>
          <thead>
            <tr className="border-b" style={{ borderColor: "var(--color-border-ch)", background: "var(--color-surface)" }}>
              {["Nama", "Jabatan", "Telepon", "Status", "Aksi"].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider"
                  style={{ color: "var(--color-muted-text)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => {
              const cfg = statusConfig[emp.status];
              return (
                <tr
                  key={emp.id}
                  className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                  style={{ borderColor: "var(--color-border-ch)" }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar employee={emp} />
                      <span className="font-semibold" style={{ color: "var(--color-ink)" }}>{emp.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--color-body)" }}>{emp.jobTitle}</td>
                  <td className="px-4 py-3" style={{ color: "var(--color-body)" }}>{emp.phone}</td>
                  <td className="px-4 py-3">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5"
                      style={{ backgroundColor: cfg.bg, color: cfg.text, borderRadius: "9999px" }}
                    >
                      {cfg.label}
                    </span>
                  </td>
                  {canWrite !== false ? (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEdit(emp)}
                          className="text-xs font-semibold px-3 py-1 border"
                          style={{
                            borderRadius: "var(--radius-btn)",
                            borderColor: "var(--color-border-ch)",
                            color: "var(--color-brand-primary)",
                            cursor: "pointer",
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setPendingId(emp.id)}
                          className="text-xs font-semibold px-3 py-1 border"
                          style={{
                            borderRadius: "var(--radius-btn)",
                            borderColor: "rgba(186,26,26,0.3)",
                            color: "var(--color-error)",
                            cursor: "pointer",
                          }}
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  ) : (
                    <td className="px-4 py-3"></td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmDeleteModal
        open={!!pendingId}
        title={`Hapus karyawan "${pendingEmp?.name ?? ""}"?`}
        message="Data karyawan akan dihapus permanen dan tidak dapat dikembalikan."
        onConfirm={() => {
          if (pendingId) onDelete(pendingId);
          setPendingId(null);
        }}
        onCancel={() => setPendingId(null)}
      />
    </>
  );
}
