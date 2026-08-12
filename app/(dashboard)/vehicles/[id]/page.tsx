import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { getVehicleById } from "@/lib/services/vehicles";
import { getActivityLogs } from "@/lib/services/activity";
import { formatDateTime } from "@/lib/utils";

const statusConfig = {
  available: { label: "Available", bg: "rgba(0,113,77,0.1)", text: "#00714D" },
  "in-use": { label: "In Use", bg: "rgba(37,99,235,0.1)", text: "#2563EB" },
  service: { label: "Service", bg: "rgba(186,26,26,0.1)", text: "#BA1A1A" },
};

const activityStatusConfig = {
  completed: { label: "Completed", bg: "rgba(0,113,77,0.1)", text: "#00714D" },
  "in-progress": { label: "In Progress", bg: "rgba(37,99,235,0.1)", text: "#2563EB" },
  pending: { label: "Pending", bg: "rgba(122,62,0,0.1)", text: "#7A3E00" },
};

function Metric({ label, value, unit }: { label: string; value: string | number; unit?: string }) {
  return (
    <div className="bg-white p-4" style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-card)" }}>
      <p className="text-xs mb-1" style={{ color: "var(--color-muted-text)" }}>{label}</p>
      <p className="text-xl font-bold" style={{ color: "var(--color-ink)" }}>
        {value}
        {unit && <span className="text-sm font-normal ml-1" style={{ color: "var(--color-muted-text)" }}>{unit}</span>}
      </p>
    </div>
  );
}

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
      <TopBar />
      <main className="p-6 space-y-6">
        {/* Back link */}
        <Link
          href="/vehicles"
          className="inline-flex items-center gap-1.5 text-sm font-semibold"
          style={{ color: "var(--color-brand-primary)" }}
        >
          ← Back to Vehicles
        </Link>

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

              {/* Battery bar */}
              <div className="mt-4">
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-semibold" style={{ color: "var(--color-body)" }}>Battery</span>
                  <span className="text-xs font-bold" style={{ color: "var(--color-ink)" }}>{vehicle.batteryPercent}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--color-page)" }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${vehicle.batteryPercent}%`,
                      backgroundColor: vehicle.batteryPercent > 20 ? "var(--color-success)" : "var(--color-error)",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Metrics grid */}
          <div className="col-span-2 grid grid-cols-3 gap-4 content-start">
            <Metric label="Current Range" value={vehicle.range} unit="km" />
            <Metric label="Max Range" value={vehicle.maxRange} unit="km" />
            <Metric label="Battery Capacity" value={vehicle.batteryCapacity} unit="kWh" />
            <Metric label="Voltage" value={vehicle.voltage} unit="V" />
            <Metric label="Temperature" value={vehicle.temperature} unit="°C" />
            <Metric label="Assigned Driver" value={vehicle.assignedDriver || "—"} />
          </div>
        </div>

        {/* Details + Activity */}
        <div className="grid grid-cols-3 gap-5">
          {/* Vehicle specs */}
          <div className="bg-white p-5" style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-card)" }}>
            <h3 className="text-sm font-bold mb-3" style={{ color: "var(--color-ink)" }}>Vehicle Details</h3>
            <InfoRow label="Make" value={vehicle.make} />
            <InfoRow label="Model" value={vehicle.model} />
            <InfoRow label="Year" value={vehicle.year} />
            <InfoRow label="VIN" value={vehicle.vin} />
            <InfoRow label="Fleet ID" value={vehicle.fleetId} />
          </div>

          {/* Activity log */}
          <div className="col-span-2 bg-white p-5" style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-card)" }}>
            <h3 className="text-sm font-bold mb-3" style={{ color: "var(--color-ink)" }}>Recent Activity</h3>
            {vehicleLogs.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--color-muted-text)" }}>No activity recorded for this vehicle.</p>
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
