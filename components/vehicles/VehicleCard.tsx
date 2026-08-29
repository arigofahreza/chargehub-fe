import Image from "next/image";
import Link from "next/link";
import { Vehicle } from "@/lib/types";

const statusConfig = {
  idle: { label: "Idle", bg: "rgba(0,113,77,0.1)", text: "var(--color-success)" },
  working: { label: "Working", bg: "rgba(37,99,235,0.1)", text: "var(--color-brand-accent)" },
  charging: { label: "Charging", bg: "rgba(180,83,9,0.1)", text: "#B45309" },
};

const btnStyle: React.CSSProperties = {
  width: 30,
  height: 30,
  borderRadius: 8,
  background: "#fff",
  border: "1px solid #DEDEDE",
  boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export function VehicleCard({
  vehicle,
  onEdit,
  onDelete,
}: {
  vehicle: Vehicle;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const cfg = statusConfig[vehicle.status];
  return (
    <div className="relative group">
      <Link href={`/vehicles/${vehicle.id}`} className="block">
        <div
          className="bg-white overflow-hidden hover:shadow-[var(--shadow-float)] transition-shadow cursor-pointer"
          style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-card)" }}
        >
          <div className="relative h-36">
            <Image
              src={vehicle.photoUrl || "/assets/vehicle-hero.jpg"}
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
            <p className="text-xs mt-0.5" style={{ color: "var(--color-muted-text)" }}>
              {vehicle.vehicleType || vehicle.model} Â· {vehicle.vin}
            </p>
          </div>
        </div>
      </Link>
      {(onEdit || onDelete) && (
        <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              title="Edit vehicle"
              style={btnStyle}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DA0037" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              title="Delete vehicle"
              style={{ ...btnStyle, borderColor: "rgba(186,26,26,0.3)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#BA1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
