"use client";
import { useState } from "react";
import { calibrateBatteryState } from "@/lib/services/activity";

interface Props {
  vehicleId: string;
  initialBatteryPct: number;
  initialCalculatedAt: string | null;
}

export function BatteryCalibrationWidget({ vehicleId, initialBatteryPct, initialCalculatedAt }: Props) {
  const [batteryPct, setBatteryPct] = useState(initialBatteryPct);
  const [calculatedAt, setCalculatedAt] = useState(initialCalculatedAt);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(initialBatteryPct.toFixed(1));
  const [saving, setSaving] = useState(false);

  const batteryColor = batteryPct >= 50 ? "#00714D" : batteryPct >= 25 ? "#B45309" : "#BA1A1A";

  async function handleSave() {
    const val = parseFloat(editValue);
    if (isNaN(val) || val < 0 || val > 100) return;
    setSaving(true);
    try {
      const updated = await calibrateBatteryState(vehicleId, val);
      setBatteryPct(updated.batteryPct);
      setCalculatedAt(updated.calculatedAt);
      setEditValue(updated.batteryPct.toFixed(1));
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid rgba(195,198,215,0.5)",
        borderRadius: 14,
        overflow: "hidden",
        marginTop: 12,
      }}
    >
      <div style={{ padding: "12px 16px 10px", borderBottom: "1px solid rgba(195,198,215,0.35)", background: "#FAFAFA" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(218,0,55,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#DA0037" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="18" height="11" rx="2" />
              <path d="M22 11v3" />
            </svg>
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#171717", margin: 0 }}>Kondisi Baterai Terkini</p>
            <p style={{ fontSize: 10, color: "#777777", margin: 0 }}>Berdasarkan aktivitas terakhir · bisa dikalibrasi</p>
          </div>
        </div>
      </div>
      <div style={{ padding: "12px 16px" }}>
        {editing ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="number"
              min={0}
              max={100}
              step={0.1}
              autoFocus
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") { setEditing(false); setEditValue(batteryPct.toFixed(1)); } }}
              style={{
                width: 80, height: 34, borderRadius: 8, border: "1px solid #DA0037",
                padding: "0 8px", fontSize: 14, fontFamily: "inherit",
                color: "#171717", outline: "none", fontWeight: 600,
              }}
            />
            <span style={{ fontSize: 13, color: "#555" }}>%</span>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ height: 34, borderRadius: 8, background: "#DA0037", border: "none", color: "#fff", fontWeight: 600, fontSize: 12, padding: "0 12px", fontFamily: "inherit", cursor: "pointer", opacity: saving ? 0.6 : 1 }}
            >
              {saving ? "..." : "Simpan"}
            </button>
            <button
              onClick={() => { setEditing(false); setEditValue(batteryPct.toFixed(1)); }}
              style={{ height: 34, borderRadius: 8, background: "#EDEDED", border: "none", color: "#555", fontWeight: 500, fontSize: 12, padding: "0 10px", fontFamily: "inherit", cursor: "pointer" }}
            >
              Batal
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 26, fontWeight: 800, color: batteryColor, letterSpacing: "-1px" }}>
                {batteryPct.toFixed(1)}%
              </span>
              {calculatedAt && (
                <span style={{ fontSize: 10, color: "#9CA3AF" }}>
                  {new Date(calculatedAt).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
            </div>
            <button
              onClick={() => setEditing(true)}
              style={{ height: 30, borderRadius: 8, background: "#F4F5F7", border: "1px solid #DEDEDE", color: "#555", fontWeight: 500, fontSize: 11, padding: "0 10px", fontFamily: "inherit", cursor: "pointer" }}
            >
              Kalibrasi
            </button>
          </div>
        )}
        {!editing && (
          <div style={{ marginTop: 8, height: 5, borderRadius: 9999, background: "rgba(195,198,215,0.3)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.max(0, Math.min(100, batteryPct))}%`, borderRadius: 9999, background: batteryColor, transition: "width 0.4s ease" }} />
          </div>
        )}
      </div>
    </div>
  );
}
