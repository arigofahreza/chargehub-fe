import { TopEnergyItem } from "@/lib/types";

interface Props {
  items: TopEnergyItem[];
}

export function TopEnergyList({ items }: Props) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #C3C6D7",
        borderRadius: 16,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
      }}
    >
      <span style={{ fontWeight: 600, fontSize: 15, color: "#0B1C30" }}>
        Top Energy Consumption
      </span>
      {items.length === 0 ? (
        <span style={{ fontSize: 12, color: "#9CA3AF" }}>No data for selected period</span>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map((v) => (
            <div key={v.vehicleId} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: "#434655" }}>{v.vehicleName}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#0B1C30" }}>{v.totalKwh} kWh</span>
              </div>
              <div
                style={{
                  height: 8,
                  borderRadius: 9999,
                  background: "#EFF4FF",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    borderRadius: 9999,
                    background: "#2563EB",
                    width: `${v.pct}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
