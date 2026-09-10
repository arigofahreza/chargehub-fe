"use client";
import { ActivityLog } from "@/lib/types";

interface Props {
  logs: ActivityLog[];
}

function fmtDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m}m`;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function VehicleUsageTimeChart({ logs }: Props) {
  const vehicleMap = new Map<string, { name: string; minutes: number; km: number }>();
  for (const l of logs) {
    if (!vehicleMap.has(l.vehicleId)) {
      vehicleMap.set(l.vehicleId, { name: l.vehicleName, minutes: 0, km: 0 });
    }
    const entry = vehicleMap.get(l.vehicleId)!;
    entry.minutes += l.durationMinutes ?? 0;
  }

  const items = Array.from(vehicleMap.values())
    .filter((v) => v.minutes > 0)
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 6);

  const maxMinutes = items[0]?.minutes || 1;

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #DEDEDE",
        borderRadius: 16,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
      }}
    >
      <div>
        <span style={{ fontWeight: 600, fontSize: 15, color: "#171717", display: "block" }}>
          Total Waktu Penggunaan
        </span>
        <span style={{ fontSize: 11, color: "#777777" }}>Per kendaraan (h/m)</span>
      </div>

      {items.length === 0 ? (
        <div style={{ height: 120, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 12, color: "#9CA3AF" }}>Tidak ada data untuk periode ini</span>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map((item, i) => {
            const pct = (item.minutes / maxMinutes) * 100;
            const isTop = i === 0;
            return (
              <div key={item.name} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "#444444", fontWeight: isTop ? 600 : 400 }}>
                    {item.name}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: isTop ? "#DA0037" : "#171717" }}>
                    {fmtDuration(item.minutes)}
                  </span>
                </div>
                <div
                  style={{
                    height: 6,
                    borderRadius: 3,
                    background: "#F3F4F6",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${pct}%`,
                      borderRadius: 3,
                      background: isTop ? "#DA0037" : "#B5002D",
                      opacity: isTop ? 1 : 0.5 + (0.5 * (1 - i / items.length)),
                      transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
