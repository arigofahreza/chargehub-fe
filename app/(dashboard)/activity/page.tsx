"use client";
import { useEffect, useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { ActivityFilters } from "@/components/activity/ActivityFilters";
import { ActivityTable } from "@/components/activity/ActivityTable";
import { ActivityFormModal } from "@/components/activity/ActivityFormModal";
import { getActivityLogs, createActivityLog, updateActivityLog } from "@/lib/services/activity";
import { getVehicles } from "@/lib/services/vehicles";
import { useFilterStore } from "@/stores/useFilterStore";
import { ActivityLog, Vehicle } from "@/lib/types";
import { Wave } from "@/components/ui/wave";

export default function ActivityPage() {
  const { activityFilter } = useFilterStore();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ActivityLog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getActivityLogs(activityFilter),
      getVehicles(),
    ]).then(([l, v]) => {
      setLogs(l);
      setVehicles(v);
      setLoading(false);
    });
  }, [activityFilter]);

  const vehicleOptions = vehicles.map((v) => ({
    id: v.id,
    name: v.name,
    unitId: v.fleetId,
  }));

  async function handleSubmit(data: Partial<ActivityLog>) {
    if (editing) {
      const updated = await updateActivityLog(editing.id, data);
      if (updated) setLogs((prev) => prev.map((l) => (l.id === editing.id ? updated : l)));
    } else {
      const created = await createActivityLog(data as Omit<ActivityLog, "id">);
      setLogs((prev) => [created, ...prev]);
    }
  }

  function handleEdit(log: ActivityLog) {
    setEditing(log);
    setModalOpen(true);
  }

  function handleAdd() {
    setEditing(null);
    setModalOpen(true);
  }

  return (
    <>
      <TopBar />
      <main className="p-4 md:p-6 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 style={{ fontWeight: 700, fontSize: 22, color: "#0B1C30", letterSpacing: "-0.4px" }}>Activity Management</h1>
            <p style={{ fontSize: 13, color: "#434655" }}>Track fleet activity logs.</p>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-1.5 flex-shrink-0"
            style={{ background: "#004AC6", border: "none", borderRadius: 10, color: "#fff", fontSize: 11, fontWeight: 600, padding: "9px 14px", fontFamily: "inherit", cursor: "pointer" }}
          >
            <span style={{ fontSize: 14, lineHeight: 1 }}>+</span>
            New Log
          </button>
        </div>

        <ActivityFilters vehicleOptions={vehicles.map((v) => ({ id: v.id, name: v.name }))} />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Wave className="size-16 text-[#004AC6]" />
            <p className="text-sm" style={{ color: "var(--color-muted-text)" }}>Loading activity...</p>
          </div>
        ) : (
          <>
            <p className="text-xs" style={{ color: "var(--color-muted-text)" }}>
              {logs.length} log{logs.length !== 1 ? "s" : ""}
            </p>
            <ActivityTable logs={logs} onEdit={handleEdit} />
            <span className="md:hidden block text-center text-xs" style={{ color: "#9CA3AF" }}>← swipe table to see more →</span>
          </>
        )}
      </main>

      <ActivityFormModal
        open={modalOpen}
        onOpenChange={(o) => {
          setModalOpen(o);
          if (!o) setEditing(null);
        }}
        initial={editing ?? undefined}
        mode={editing ? "edit" : "add"}
        onSubmit={handleSubmit}
        vehicleOptions={vehicleOptions}
      />
    </>
  );
}
