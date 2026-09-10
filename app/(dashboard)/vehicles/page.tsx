"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fadeUpVariants, staggerContainerVariants } from "@/lib/motion";
import { VehicleCard } from "@/components/vehicles/VehicleCard";
import { VehicleFilters } from "@/components/vehicles/VehicleFilters";
import { VehicleFormModal } from "@/components/vehicles/VehicleFormModal";
import { getVehicles, deleteVehicle } from "@/lib/services/vehicles";
import { useFilterStore } from "@/stores/useFilterStore";
import { useDebounce } from "@/hooks/useDebounce";
import { Vehicle } from "@/lib/types";
import { Wave } from "@/components/ui/wave";
import { usePermissions } from "@/hooks/usePermissions";

const PAGE_SIZE = 8;

export default function VehiclesPage() {
  const perms = usePermissions();
  const { vehicleFilter } = useFilterStore();
  const debouncedSearch = useDebounce(vehicleFilter.search ?? "", 300);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getVehicles({ search: debouncedSearch, status: vehicleFilter.status }).then((data) => {
      setVehicles(data);
      setPage(1);
      setLoading(false);
    });
  }, [debouncedSearch, vehicleFilter.status]);

  const totalPages = Math.ceil(vehicles.length / PAGE_SIZE);
  const paged = vehicles.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function handleAddVehicle(vehicle: Vehicle) {
    setVehicles((prev) => [vehicle, ...prev]);
  }

  async function handleEditVehicle(updated: Vehicle) {
    setVehicles((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
  }

  function openEdit(vehicle: Vehicle) {
    setEditing(vehicle);
    setEditOpen(true);
  }

  async function handleDeleteVehicle(id: string) {
    const ok = await deleteVehicle(id);
    if (ok) setVehicles((prev) => prev.filter((v) => v.id !== id));
  }

  return (
    <>
      <main className="p-4 md:p-6 space-y-5">
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <div>
              <h1 style={{ fontWeight: 700, fontSize: 22, color: "#171717", letterSpacing: "-0.4px" }}>Manajemen Kendaraan</h1>
              <p style={{ fontSize: 13, color: "#444444" }}>Pantau status armada &amp; penugasan.</p>
            </div>
            {perms.canWriteVehicles && (
              <button
                onClick={() => setAddOpen(true)}
                className="flex items-center gap-1.5 flex-shrink-0"
                style={{
                  background: "#DA0037",
                  border: "none",
                  borderRadius: 10,
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "9px 14px",
                  fontFamily: "inherit",
                  cursor: "pointer",
                }}
              >
                <span style={{ fontSize: 14, lineHeight: 1 }}>+</span>
                Tambah Kendaraan
              </button>
            )}
          </div>
          <VehicleFilters />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Wave className="size-16 text-[#DA0037]" />
            <p className="text-sm" style={{ color: "var(--color-muted-text)" }}>Memuat kendaraan...</p>
          </div>
        ) : (
          <>
            <p className="text-xs" style={{ color: "var(--color-muted-text)" }}>
              {vehicles.length} kendaraan ditemukan
            </p>

            {paged.length === 0 ? (
              <div className="text-center py-20" style={{ color: "var(--color-muted-text)" }}>
                Tidak ada kendaraan yang sesuai filter.
              </div>
            ) : (
              <motion.div
                key={page}
                className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
                variants={staggerContainerVariants}
                initial="hidden"
                animate="visible"
              >
                {paged.map((v) => (
                  <motion.div key={v.id} variants={fadeUpVariants}>
                    <VehicleCard
                      vehicle={v}
                      onEdit={perms.canWriteVehicles ? () => openEdit(v) : undefined}
                      onDelete={perms.canWriteVehicles ? () => handleDeleteVehicle(v.id) : undefined}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </>
        )}

        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 text-xs font-semibold border disabled:opacity-40"
              style={{
                borderRadius: "var(--radius-btn)",
                borderColor: "var(--color-border-ch)",
                color: "var(--color-body)",
              }}
            >
              ← Sebelumnya
            </button>
            <span className="text-xs" style={{ color: "var(--color-muted-text)" }}>
              {page} / {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 text-xs font-semibold border disabled:opacity-40"
              style={{
                borderRadius: "var(--radius-btn)",
                borderColor: "var(--color-border-ch)",
                color: "var(--color-body)",
              }}
            >
              Selanjutnya →
            </button>
          </div>
        )}
      </main>

      <VehicleFormModal
        open={addOpen}
        onOpenChange={setAddOpen}
        mode="add"
        onSubmit={handleAddVehicle}
      />

      <VehicleFormModal
        open={editOpen}
        onOpenChange={(o) => { setEditOpen(o); if (!o) setEditing(null); }}
        mode="edit"
        initial={editing ?? undefined}
        onSubmit={handleEditVehicle}
      />
    </>
  );
}
