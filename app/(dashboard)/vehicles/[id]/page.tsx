import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getVehicleById } from "@/lib/services/vehicles";
import { getActivityLogs } from "@/lib/services/activity";
import { formatDateTime } from "@/lib/utils";
import { EditVehicleButton } from "@/components/vehicles/EditVehicleButton";

const statusConfig = {
  idle: { label: "Idle", bg: "rgba(0,113,77,0.1)", text: "#00714D" },
  working: { label: "Working", bg: "rgba(37,99,235,0.1)", text: "#B5002D" },
  charging: { label: "Charging", bg: "rgba(180,83,9,0.1)", text: "#B45309" },
};

const activityStatusConfig = {
  completed: { label: "Selesai", bg: "rgba(0,113,77,0.1)", text: "#00714D" },
  "in-progress": { label: "Dalam Proses", bg: "rgba(37,99,235,0.1)", text: "#B5002D" },
  pending: { label: "Menunggu", bg: "rgba(122,62,0,0.1)", text: "#7A3E00" },
};


function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between py-2.5 border-b last:border-0" style={{ borderColor: "var(--color-border-ch)" }}>
      <span className="text-sm" style={{ color: "var(--color-muted-text)" }}>{label}</span>
      <span className="text-sm font-semibold" style={{ color: "var(--color-ink)" }}>{value}</span>
    </div>
  );
}

export default async function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [vehicle, allLogs] = await Promise.all([getVehicleById(id), getActivityLogs()]);
  if (!vehicle) notFound();

  const vehicleLogs = allLogs.filter((l) => l.vehicleId === vehicle.id).slice(0, 5);
  const cfg = statusConfig[vehicle.status];

  return (
    <>
      <main className="p-6 space-y-6">
        {/* Back link + Edit button */}
        <div className="flex items-center justify-between">
          <Link
            href="/vehicles"
            className="inline-flex items-center gap-1.5 text-sm font-semibold"
            style={{ color: "var(--color-brand-primary)" }}
          >
            ← Kembali ke Kendaraan
          </Link>
          <EditVehicleButton vehicle={vehicle} />
        </div>

        {/* Hero row */}
        <div className="grid grid-cols-3 gap-5">
          {/* Photo + status */}
          <div className="col-span-1 bg-white overflow-hidden" style={{ borderRadius: "var(--radius-card-lg)", boxShadow: "var(--shadow-card)" }}>
            <div className="relative h-52">
              <Image src={vehicle.photoUrl} alt={vehicle.name} fill className="object-cover" />
              <span
                className="absolute top-3 left-3 text-xs font-bold px-3 py-1"
                style={{ backgroundColor: cfg.bg, color: cfg.text, borderRadius: "9999px" }}
              >
                {cfg.label}
              </span>
            </div>
            <div className="p-4">
              <h2 className="text-base font-bold" style={{ color: "var(--color-ink)" }}>{vehicle.name}</h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-muted-text)" }}>{vehicle.fleetId}</p>

              {/* Kapasitas Baterai */}
              <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--color-border-ch)" }}>
                <p className="text-xs" style={{ color: "var(--color-muted-text)" }}>Kapasitas Baterai</p>
                <p className="text-lg font-bold mt-0.5" style={{ color: "var(--color-ink)" }}>
                  {vehicle.batteryCapacity} <span className="text-sm font-normal" style={{ color: "var(--color-muted-text)" }}>kWh</span>
                </p>
              </div>
            </div>
          </div>

          {/* Detail kendaraan di sisi kanan hero */}
          <div className="col-span-2 bg-white p-5" style={{ borderRadius: "var(--radius-card-lg)", boxShadow: "var(--shadow-card)" }}>
            <h3 className="text-sm font-bold mb-3" style={{ color: "var(--color-ink)" }}>Detail Kendaraan</h3>
            <InfoRow label="Merek" value={vehicle.make} />
            <InfoRow label="Model" value={vehicle.model} />
            <InfoRow label="Nomer Unit" value={vehicle.vin} />
            <InfoRow label="Fleet ID" value={vehicle.fleetId} />
            <InfoRow label="Waktu Beroperasi" value={`${vehicle.operatingTime ?? 0} jam`} />
          </div>
        </div>

        {/* Activity */}
        <div className="grid grid-cols-3 gap-5">
          {/* Activity log */}
          <div className="col-span-3 bg-white p-5" style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-card)" }}>
            <h3 className="text-sm font-bold mb-3" style={{ color: "var(--color-ink)" }}>Aktivitas Terkini</h3>
            {vehicleLogs.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--color-muted-text)" }}>Belum ada aktivitas untuk kendaraan ini.</p>
            ) : (
              <div className="space-y-3">
                {vehicleLogs.map((log) => {
                  const sc = activityStatusConfig[log.status];
                  return (
                    <div key={log.id} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: "var(--color-border-ch)" }}>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "var(--color-ink)" }}>{log.serviceType}</p>
                        <p className="text-xs" style={{ color: "var(--color-muted-text)" }}>
                          {formatDateTime(log.dateTime)} · {log.driver}
                        </p>
                      </div>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5"
                        style={{ backgroundColor: sc.bg, color: sc.text, borderRadius: "9999px" }}
                      >
                        {sc.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
