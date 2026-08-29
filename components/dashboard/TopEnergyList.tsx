"use client";
import { useEffect, useState } from "react";
import { TopEnergyItem } from "@/lib/types";

interface Props {
  items: TopEnergyItem[];
}

export function TopEnergyList({ items }: Props) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    setShow(false);
    let r1: number, r2: number;
    r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => setShow(true));
    });
    return () => { cancelAnimationFrame(r1); cancelAnimationFrame(r2); };
  }, [items]);

  const sorted = [...items].sort((a, b) => b.totalKwh - a.totalKwh);

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #DEDEDE",
        borderRadius: 16,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
      }}
    >
      <span style={{ fontWeight: 600, fontSize: 15, color: "#171717" }}>
        Top Energy Consumption
      </span>
      {sorted.length === 0 ? (
        <span style={{ fontSize: 12, color: "#9CA3AF" }}>No data for selected period</span>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {sorted.map((v, i) => (
            <div key={v.vehicleId} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: "#444444", fontWeight: i === 0 ? 600 : 400 }}>
                  {v.vehicleName}
                </span>
                <span style={{ fontSize: 12, fontWeight: 600, color: i === 0 ? "#DA0037" : "#171717" }}>
                  {v.totalKwh} kWh
                </span>
              </div>
              <div
                style={{
                  height: 7,
                  borderRadius: 9999,
                  background: "#F3F4F6",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    borderRadius: 9999,
                    background: i === 0 ? "#DA0037" : "#B5002D",
                    opacity: i === 0 ? 1 : 0.5 + 0.15 * (sorted.length - i),
                    width: show ? `${v.pct}%` : "0%",
                    transition: `width 0.7s cubic-bezier(0.4,0,0.2,1) ${i * 0.08}s`,
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
