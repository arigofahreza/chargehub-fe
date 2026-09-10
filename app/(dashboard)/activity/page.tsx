"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fadeUpVariants } from "@/lib/motion";
import { ActivityFilters } from "@/components/activity/ActivityFilters";
import { ActivityTable } from "@/components/activity/ActivityTable";
import { ActivityFormModal } from "@/components/activity/ActivityFormModal";
import { getActivityLogs, deleteActivityLog, getSupervisors } from "@/lib/services/activity";
import { useActivityStore } from "@/stores/useActivityStore";
import { getVehicles } from "@/lib/services/vehicles";
import { getEmployees } from "@/lib/services/employees";
import { useFilterStore } from "@/stores/useFilterStore";
import { ActivityLog, Vehicle, Employee } from "@/lib/types";
import { Wave } from "@/components/ui/wave";
import { usePermissions } from "@/hooks/usePermissions";
import { DownloadActivityButton } from "@/components/activity/DownloadActivityButton";

export default function ActivityPage() {
  const { activityFilter } = useFilterStore();
  const { addLog, updateLog } = useActivityStore();
  const perms = usePermissions();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Employee[]>([]);
  const [supervisors, setSupervisors] = useState<{ value: string; label: string }[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ActivityLog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEmployees("active").then(setDrivers);
    getSupervisors().then(setSupervisors);
  }, []);

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
    batteryPercent: v.batteryPercent,
    batteryCapacityKwh: v.batteryCapacity,
    degradationRatePct: v.degradationRatePct,
    vehicleType: v.vehicleType,
  }));

  async function handleSubmit(data: Partial<ActivityLog>) {
    if (editing) {
      const updated = await updateLog(editing.id, data);
      if (updated) setLogs((prev) => prev.map((l) => (l.id === editing.id ? updated : l)));
    } else {
      const created = await addLog(data as Omit<ActivityLog, "id">);
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

  async function handleDelete(id: string) {
    const ok = await deleteActivityLog(id);
    if (ok) setLogs((prev) => prev.filter((l) => l.id !== id));
  }

  return (
    <motion.div variants={fadeUpVariants} initial="hidden" animate="visible">
      <main className="p-4 md:p-6 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 style={{ fontWeight: 700, fontSize: 22, color: "#171717", letterSpacing: "-0.4px" }}>Manajemen Aktivitas</h1>
            <p style={{ fontSize: 13, color: "#444444" }}>Catat aktivitas armada.</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <DownloadActivityButton filter={activityFilter} />
            {perms.canWriteActivity && (
              <button
                onClick={handleAdd}
                className="flex items-center gap-1.5"
                style={{ background: "#DA0037", border: "none", borderRadius: 10, color: "#fff", fontSize: 11, fontWeight: 600, padding: "9px 14px", fontFamily: "inherit", cursor: "pointer" }}
              >
                <span style={{ fontSize: 14, lineHeight: 1 }}>+</span>
                Input Aktivitas
              </button>
            )}
          </div>
        </div>

        <ActivityFilters vehicleOptions={vehicles.map((v) => ({ id: v.id, name: v.name }))} />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Wave className="size-16 text-[#DA0037]" />
            <p className="text-sm" style={{ color: "var(--color-muted-text)" }}>Memuat aktivitas...</p>
          </div>
        ) : (
          <>
            <p className="text-xs" style={{ color: "var(--color-muted-text)" }}>
              {logs.length} log{logs.length !== 1 ? "s" : ""}
            </p>
            <ActivityTable logs={logs} onEdit={handleEdit} onDelete={handleDelete} canWrite={perms.canWriteActivity} />
            <span className="md:hidden block text-center text-xs" style={{ color: "#9CA3AF" }}>← geser tabel untuk lihat selengkapnya →</span>
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
        supervisorOptions={supervisors}
        driverOptions={drivers.map((e) => ({ value: e.name, label: e.name, jobTitle: e.jobTitle }))}
      />
    </motion.div>
  );
}
