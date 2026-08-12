import Image from "next/image";
import Link from "next/link";
import { Vehicle } from "@/lib/types";

const statusConfig = {
  available: { label: "Available", bg: "rgba(0,113,77,0.1)", text: "var(--color-success)" },
  "in-use": { label: "In Use", bg: "rgba(37,99,235,0.1)", text: "var(--color-brand-accent)" },
  service: { label: "Service", bg: "rgba(186,26,26,0.1)", text: "var(--color-error)" },
};

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const cfg = statusConfig[vehicle.status];
  return (
    <Link href={`/vehicles/${vehicle.id}`} className="block">
      <div
        className="bg-white overflow-hidden hover:shadow-[var(--shadow-float)] transition-shadow cursor-pointer"
        style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-card)" }}
      >
        <div className="relative h-36">
          <Image
            src={vehicle.photoUrl}
            alt={vehicle.name}
            fill
            className="object-cover"
          />
          <span
            className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5"
            style={{
              backgroundColor: cfg.bg,
              color: cfg.text,
              borderRadius: "9999px",
            }}
          >
            {cfg.label}
          </span>
        </div>
        <div className="p-3">
          <p
            className="text-sm font-bold truncate"
            style={{ color: "var(--color-ink)" }}
          >
            {vehicle.name}
          </p>
          <p className="text-xs" style={{ color: "var(--color-muted-text)" }}>
            {vehicle.fleetId}
          </p>
        </div>
      </div>
    </Link>
  );
}
