"use client";
import { useFilterStore } from "@/stores/useFilterStore";
import { VehicleStatus } from "@/lib/types";

const chips: { label: string; value: VehicleStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Available", value: "available" },
  { label: "In Use", value: "in-use" },
  { label: "Service", value: "service" },
];

export function VehicleFilters() {
  const { vehicleFilter, setVehicleFilter } = useFilterStore();

  return (
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
      {/* Search with icon */}
      <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
        <input
          type="text"
          placeholder="Search vehicle..."
          value={vehicleFilter.search ?? ""}
          onChange={(e) => setVehicleFilter({ search: e.target.value })}
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

      {/* Status chips */}
      <div className="flex gap-2 flex-wrap">
        {chips.map((c) => {
          const active = (vehicleFilter.status ?? "all") === c.value;
          return (
            <button
              key={c.value}
              onClick={() => setVehicleFilter({ status: c.value })}
              className="text-xs font-semibold px-3 py-1.5 transition-colors"
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
  );
}
