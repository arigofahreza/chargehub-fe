"use client";
import { useEffect, useState } from "react";
import { FleetStatusData } from "@/lib/types";

interface Props {
  data: FleetStatusData;
}

export function FleetStatusDonut({ data }: Props) {
  const { available, inUse, service, total } = data;
  const safeTotal = total || 1;
  const availPct = Math.round((available / safeTotal) * 100);
  const inUsePct = Math.round((inUse / safeTotal) * 100);
  const servicePct = Math.round((service / safeTotal) * 100);

  const availDash = availPct;
  const inUseDash = inUsePct;
  const serviceDash = servicePct;
  const availOffset = 25;
  const inUseOffset = -(availDash - 25);
  const serviceOffset = -(availDash + inUseDash - 25);

  const [show, setShow] = useState(false);
  useEffect(() => {
    setShow(false);
    const t = setTimeout(() => setShow(true), 40);
    return () => clearTimeout(t);
  }, [data]);

  const arcStyle: React.CSSProperties = {
    transition: "stroke-dasharray 1s cubic-bezier(0.4,0,0.2,1)",
  };

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
      <span style={{ fontWeight: 600, fontSize: 15, color: "#171717" }}>Fleet Status</span>

      <div style={{ display: "flex", justifyContent: "center", position: "relative" }}>
        <svg width="160" height="160" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#EDEDED" strokeWidth="4" />
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#DA0037" strokeWidth="4"
            strokeDasharray={show ? `${availDash} 100` : "0 100"}
            strokeDashoffset={availOffset} strokeLinecap="round"
            style={arcStyle} />
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#B5002D" strokeWidth="4"
            strokeDasharray={show ? `${inUseDash} 100` : "0 100"}
            strokeDashoffset={inUseOffset} strokeLinecap="round" opacity="0.55"
            style={{ ...arcStyle, transitionDelay: "0.2s" }} />
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#BA1A1A" strokeWidth="4"
            strokeDasharray={show ? `${serviceDash} 100` : "0 100"}
            strokeDashoffset={serviceOffset} strokeLinecap="round" opacity="0.7"
            style={{ ...arcStyle, transitionDelay: "0.4s" }} />
        </svg>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
          }}
        >
          <span style={{ display: "block", fontSize: 26, fontWeight: 700, color: "#171717" }}>{total}</span>
          <span style={{ fontSize: 9, color: "#777777", letterSpacing: "0.3px", textTransform: "uppercase" }}>Total</span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          { color: "#DA0037", label: "Available", count: `${available} (${availPct}%)` },
          { color: "#B5002D", label: "In Use", count: `${inUse} (${inUsePct}%)` },
          { color: "#BA1A1A", label: "Service Needed", count: `${service} (${servicePct}%)` },
        ].map(({ color, label, count }) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#444444" }}>
              <span style={{ width: 9, height: 9, borderRadius: 9999, background: color, display: "inline-block" }} />
              {label}
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#171717" }}>{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
