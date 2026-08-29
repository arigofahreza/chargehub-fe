import Image from "next/image";
import { Vehicle } from "@/lib/types";

interface Props {
  vehicle: Vehicle | null;
}

const metrics = [
  { key: "status" as keyof Vehicle, label: "STATUS", format: (v: string) => v === "idle" ? "Idle" : v === "working" ? "Working" : "Charging" },
  { key: "batteryPercent" as keyof Vehicle, label: "BATERAI", format: (v: number) => `${v}%` },
  { key: "operatingTime" as keyof Vehicle, label: "OPERASI", format: (v: number) => `${v} jam` },
  { key: "fleetId" as keyof Vehicle, label: "FLEET ID", format: (v: string) => v || "-" },
];

function SkeletonBlock({ w, h, radius = 6 }: { w: string | number; h: number; radius?: number }) {
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: radius,
        background: "linear-gradient(90deg, #E8ECF4 25%, #F0F3FA 50%, #E8ECF4 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite",
      }}
    />
  );
}

export function SelectedVehicleCard({ vehicle }: Props) {
  const cardStyle: React.CSSProperties = {
    background: "#fff",
    border: "1px solid #DEDEDE",
    borderRadius: 16,
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 16,
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
  };

  if (!vehicle) {
    return (
      <div style={cardStyle}>
        <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
        {/* Header skeleton */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "#E8ECF4" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <SkeletonBlock w={120} h={14} />
              <SkeletonBlock w={80} h={10} />
            </div>
          </div>
        </div>

        {/* Body: prompt overlay over dimmed skeleton */}
        <div style={{ position: "relative" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16, opacity: 0.35, pointerEvents: "none" }}>
            <div style={{ borderRadius: 12, overflow: "hidden", height: 170, background: "#E8ECF4" }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, alignContent: "start" }}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} style={{ background: "#EDEDED", border: "1px solid #DEDEDE", borderRadius: 10, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
                  <SkeletonBlock w="60%" h={9} />
                  <SkeletonBlock w="80%" h={18} />
                </div>
              ))}
            </div>
          </div>

          {/* Center overlay prompt */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                background: "rgba(255,255,255,0.92)",
                backdropFilter: "blur(4px)",
                borderRadius: 12,
                padding: "14px 20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#DA0037" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#171717" }}>Select a vehicle</span>
              <span style={{ fontSize: 11, color: "#777777", textAlign: "center" }}>
                Use the filter above to choose a specific vehicle
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={cardStyle}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            background: "rgba(218,0,55,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 18 18" fill="#DA0037">
            <path d="M 2 18 C 1.45 18 0.979 17.804 0.587 17.413 C 0.196 17.021 0 16.55 0 16 L 0 2 C 0 1.45 0.196 0.979 0.587 0.587 C 0.979 0.196 1.45 0 2 0 L 9 0 L 9 2 L 2 2 L 2 16 L 9 16 L 9 18 L 2 18 M 13 14 L 11.625 12.55 L 14.175 10 L 6 10 L 6 8 L 14.175 8 L 11.625 5.45 L 13 4 L 18 9 L 13 14" />
          </svg>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontWeight: 600, fontSize: 15, color: "#171717" }}>Selected Vehicle</span>
          <span style={{ fontSize: 11, color: "#444444" }}>
            {vehicle.name} Â· {vehicle.fleetId}
          </span>
        </div>
      </div>

      {/* Body: photo (left) + 2x2 metrics (right) */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }}>
        {/* Photo with battery overlay */}
        <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", height: 170 }}>
          <Image src={vehicle.photoUrl || "/assets/vehicle-hero.jpg"} alt={vehicle.name} fill style={{ objectFit: "cover" }} />
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
            <svg width="9" height="14" viewBox="0 0 13 20" fill="#DA0037">
              <path d="M 6.55 16.2 L 11.725 10 L 7.725 10 L 8.45 4.325 L 3.825 11 L 7.3 11 L 6.55 16.2" />
            </svg>
            <span style={{ fontSize: 14, color: "#DA0037", fontWeight: 600 }}>
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
            const color = isStatus && raw === "idle" ? "#00714D"
              : isStatus && raw === "charging" ? "#B45309"
              : "#171717";
            return (
              <div
                key={label}
                style={{
                  background: "#EDEDED",
                  border: "1px solid #DEDEDE",
                  borderRadius: 10,
                  padding: "10px 12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <span style={{ fontSize: 9, color: "#777777", letterSpacing: "0.3px" }}>{label}</span>
                <span style={{ fontSize: key === "fleetId" ? 11 : 15, fontWeight: 700, color }}>
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
