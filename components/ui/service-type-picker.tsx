"use client";
import { useEffect, useState } from "react";
import { getActivityCategories, type ActivityCategory } from "@/lib/services/management";

interface Props {
  value: string;
  onChange: (value: string) => void;
  allowedValues?: string[];
}

export function ServiceTypePicker({ value, onChange, allowedValues }: Props) {
  const [categories, setCategories] = useState<ActivityCategory[]>([]);

  useEffect(() => {
    getActivityCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  const visible = allowedValues
    ? categories.filter((c) => allowedValues.includes(c.name))
    : categories;

  if (visible.length === 0) {
    return (
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: "#aaa" }}>Memuat kategori...</span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {visible.map((cat) => {
        const active = value === cat.name;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onChange(cat.name)}
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
              background: "#EDEDED",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.15s ease",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              if (!active) (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(218,0,55,0.3)";
            }}
            onMouseLeave={(e) => {
              if (!active) (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(195,198,215,0.5)";
            }}
          >
            {cat.icon_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cat.icon_url}
                alt={cat.name}
                style={{
                  width: 22,
                  height: 22,
                  objectFit: "contain",
                  filter: active ? "none" : "grayscale(40%)",
                  opacity: active ? 1 : 0.7,
                }}
              />
            ) : (
              <span style={{ fontSize: 18, lineHeight: 1 }}>⚡</span>
            )}
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
              {cat.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
