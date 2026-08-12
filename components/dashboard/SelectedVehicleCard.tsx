import Image from "next/image";
import { Vehicle } from "@/lib/types";

interface Props {
  vehicle: Vehicle;
}

const metrics = [
  { key: "temperature" as keyof Vehicle, label: "TEMP", format: (v: number) => `${v}°C` },
  { key: "voltage" as keyof Vehicle, label: "VOLTAGE", format: (v: number) => `${v} V` },
  { key: "status" as keyof Vehicle, label: "STATUS", format: (v: string) => v === "available" ? "Active" : v === "in-use" ? "In Use" : "Service" },
  { key: "range" as keyof Vehicle, label: "RANGE", format: (v: number) => `${v} mi` },
];

export function SelectedVehicleCard({ vehicle }: Props) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #C3C6D7",
        borderRadius: 16,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              background: "rgba(37,99,235,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 18 18" fill="#004AC6">
              <path d="M 2 18 C 1.45 18 0.979 17.804 0.587 17.413 C 0.196 17.021 0 16.55 0 16 L 0 2 C 0 1.45 0.196 0.979 0.587 0.587 C 0.979 0.196 1.45 0 2 0 L 9 0 L 9 2 L 2 2 L 2 16 L 9 16 L 9 18 L 2 18 M 13 14 L 11.625 12.55 L 14.175 10 L 6 10 L 6 8 L 14.175 8 L 11.625 5.45 L 13 4 L 18 9 L 13 14" />
            </svg>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontWeight: 600, fontSize: 15, color: "#0B1C30" }}>Selected Vehicle</span>
            <span style={{ fontSize: 11, color: "#434655" }}>
              {vehicle.name} · {vehicle.fleetId}
            </span>
          </div>
        </div>
        <button
          style={{
            background: "#004AC6",
            border: "none",
            borderRadius: 8,
            color: "#fff",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.4px",
            padding: "8px 12px",
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontFamily: "inherit",
            cursor: "pointer",
          }}
        >
          <svg width="11" height="14" viewBox="0 0 16 20" fill="#fff">
            <path d="M 6.55 16.2 L 11.725 10 L 7.725 10 L 8.45 4.325 L 3.825 11 L 7.3 11 L 6.55 16.2 M 4 20 L 5 13 L 0 13 L 9 0 L 11 0 L 10 8 L 16 8 L 6 20 L 4 20" />
          </svg>
          Charge Now
        </button>
      </div>

      {/* Body: photo (left) + 2x2 metrics (right) */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }}>
        {/* Photo with battery overlay */}
        <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", height: 170 }}>
          <Image src={vehicle.photoUrl} alt={vehicle.name} fill style={{ objectFit: "cover" }} />
          <div
            style={{
              position: "absolute",
              left: 10,
              bottom: 10,
              background: "rgba(211,228,254,0.9)",
              backdropFilter: "blur(4px)",
              borderRadius: 9999,
              padding: "6px 12px",
              display: "flex",
              alignItems: "center",
              gap: 6,
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
            }}
          >
            <svg width="9" height="14" viewBox="0 0 13 20" fill="#004AC6">
              <path d="M 6.55 16.2 L 11.725 10 L 7.725 10 L 8.45 4.325 L 3.825 11 L 7.3 11 L 6.55 16.2" />
            </svg>
            <span style={{ fontSize: 14, color: "#004AC6", fontWeight: 600 }}>
              {vehicle.batteryPercent}%
            </span>
          </div>
        </div>

        {/* 2x2 metric tiles */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            alignContent: "start",
          }}
        >
          {metrics.map(({ key, label, format }) => {
            const raw = vehicle[key];
            const display = format(raw as never);
            const isStatus = key === "status";
            return (
              <div
                key={label}
                style={{
                  background: "#F8F9FF",
                  border: "1px solid #C3C6D7",
                  borderRadius: 10,
                  padding: "10px 12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <span style={{ fontSize: 9, color: "#737686", letterSpacing: "0.3px" }}>{label}</span>
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: isStatus && raw === "available" ? "#00714D" : "#0B1C30",
                  }}
                >
                  {display}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
