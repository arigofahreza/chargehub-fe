"use client";
import { Layers3, Package, Wrench, Zap, ClipboardCheck, Truck } from "lucide-react";

const SERVICE_CONFIG = [
  { value: "Heavy Stacking", label: "Heavy Stacking", Icon: Layers3 },
  { value: "Light Stacking", label: "Light Stacking", Icon: Package },
  { value: "Maintenance Access", label: "Maintenance", Icon: Wrench },
  { value: "Charging", label: "Charging", Icon: Zap },
  { value: "Inspection", label: "Inspection", Icon: ClipboardCheck },
  { value: "Loading", label: "Loading", Icon: Truck },
] as const;

interface Props {
  value: string;
  onChange: (value: string) => void;
  allowedValues?: string[];
}

export function ServiceTypePicker({ value, onChange, allowedValues }: Props) {
  const visible = allowedValues
    ? SERVICE_CONFIG.filter((s) => allowedValues.includes(s.value))
    : SERVICE_CONFIG;
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {visible.map(({ value: v, label, Icon }) => {
        const active = value === v;
        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              width: 80,
              height: 72,
              borderRadius: 10,
              border: active ? "1.5px solid #DA0037" : "1px solid rgba(195,198,215,0.5)",
              background: active ? "#EDEDED" : "#EDEDED",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.15s ease",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              if (!active) {
                (e.currentTarget as HTMLButtonElement).style.background = "#EDEDED";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(218,0,55,0.3)";
              }
            }}
            onMouseLeave={(e) => {
              if (!active) {
                (e.currentTarget as HTMLButtonElement).style.background = "#EDEDED";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(195,198,215,0.5)";
              }
            }}
          >
            <Icon
              size={20}
              strokeWidth={1.8}
              style={{ color: active ? "#DA0037" : "#777777" }}
            />
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: active ? "#DA0037" : "#444444",
                textAlign: "center",
                lineHeight: 1.2,
                paddingInline: 4,
              }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export const SERVICE_TYPE_VALUES = SERVICE_CONFIG.map((s) => s.value);
