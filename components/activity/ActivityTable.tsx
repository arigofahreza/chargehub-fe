"use client";
import { useState } from "react";
import { ActivityLog, ActivityStatus } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";

const statusConfig: Record<ActivityStatus, { label: string; bg: string; text: string }> = {
  completed: { label: "Selesai", bg: "rgba(0,113,77,0.1)", text: "#00714D" },
  "in-progress": { label: "Berlangsung", bg: "rgba(218,0,55,0.1)", text: "#B5002D" },
  pending: { label: "Menunggu", bg: "rgba(122,62,0,0.1)", text: "#7A3E00" },
};

interface Props {
  logs: ActivityLog[];
  onEdit: (log: ActivityLog) => void;
  onDelete: (id: string) => void;
  canWrite?: boolean;
}

export function ActivityTable({ logs, onEdit, onDelete, canWrite }: Props) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const pendingLog = logs.find((l) => l.id === pendingId);

  if (logs.length === 0) {
    return (
      <div className="text-center py-16 text-sm" style={{ color: "var(--color-muted-text)" }}>
        Belum ada log aktivitas.
      </div>
    );
  }

  return (
    <>
      <div style={{ overflowX: "auto", borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-card)", background: "#fff" }}>
        <table className="text-sm" style={{ borderCollapse: "collapse", minWidth: 760, width: "100%" }}>
          <thead>
            <tr className="border-b" style={{ borderColor: "var(--color-border-ch)", background: "var(--color-surface)" }}>
              {["Tanggal & Waktu", "Kendaraan", "Unit ID", "Tipe Aktivitas", "Pengawas", "Pengemudi", "Status", "Dibuat Oleh", ""].map((h) => (
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
            {logs.map((log) => {
              const cfg = statusConfig[log.status];
              return (
                <tr
                  key={log.id}
                  className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                  style={{ borderColor: "var(--color-border-ch)" }}
                >
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--color-body)" }}>
                    {formatDateTime(log.dateTime)}
                  </td>
                  <td className="px-4 py-3 font-semibold" style={{ color: "var(--color-ink)" }}>
                    {log.vehicleName}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--color-body)" }}>
                    {log.unitId}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--color-body)" }}>
                    {log.serviceType}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--color-body)" }}>
                    {log.supervisor ?? "-"}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--color-body)" }}>
                    {log.driver}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5"
                      style={{ backgroundColor: cfg.bg, color: cfg.text, borderRadius: "9999px" }}
                    >
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--color-muted-text)" }}>
                    {log.createdBy}
                  </td>
                  {canWrite !== false ? (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onEdit(log)}
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
                          onClick={() => setPendingId(log.id)}
                          className="text-xs font-semibold px-3 py-1 border"
                          style={{
                            borderRadius: "var(--radius-btn)",
                            borderColor: "rgba(186,26,26,0.3)",
                            color: "var(--color-error)",
                            cursor: "pointer",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  ) : (
                    <td></td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmDeleteModal
        open={!!pendingId}
        title={`Hapus log "${pendingLog?.vehicleName ?? ""}"?`}
        message="Log aktivitas akan dihapus permanen dan tidak dapat dikembalikan."
        onConfirm={() => {
          if (pendingId) onDelete(pendingId);
          setPendingId(null);
        }}
        onCancel={() => setPendingId(null)}
      />
    </>
  );
}
