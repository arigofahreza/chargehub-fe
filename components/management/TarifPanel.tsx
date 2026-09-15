"use client";
import { useState } from "react";
import { Pencil, Check, X } from "lucide-react";

interface Props {
  tariff: number;
  onUpdate: (value: number) => Promise<void>;
  canWrite: boolean;
}

export function TarifPanel({ tariff, onUpdate, canWrite }: Props) {
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEdit() {
    setInputVal(String(tariff));
    setError(null);
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setError(null);
  }

  async function handleSave() {
    const val = parseFloat(inputVal);
    if (isNaN(val) || val <= 0) {
      setError("Tarif harus angka positif");
      return;
    }
    setSaving(true);
    try {
      await onUpdate(val);
      setEditing(false);
      setError(null);
    } catch {
      setError("Gagal menyimpan tarif");
    } finally {
      setSaving(false);
    }
  }

  const iconBtn: React.CSSProperties = {
    background: "none", border: "none", cursor: "pointer",
    padding: 4, borderRadius: 6, display: "flex", alignItems: "center",
  };

  return (
    <div>
      <p style={{ fontSize: 12, color: "#888", marginBottom: 20 }}>
        Tarif digunakan untuk menghitung biaya pengisian daya secara otomatis:{" "}
        <strong>biaya = energi (kWh) × tarif</strong>. Energi charging dihitung dari 30% ke 100% (70% kapasitas baterai).
      </p>

      <div style={{
        display: "inline-flex", flexDirection: "column", gap: 8,
        background: "#F9FAFB", border: "1px solid #EDEDED",
        borderRadius: 12, padding: "16px 20px", minWidth: 260,
      }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "#777", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          TARIF PER kWh
        </span>

        {editing ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 14, color: "#555", fontWeight: 500 }}>Rp</span>
              <input
                type="number"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") cancelEdit(); }}
                min={1}
                step={1}
                autoFocus
                style={{
                  height: 40, width: 140, borderRadius: 8,
                  border: "1px solid #DA0037", padding: "0 10px",
                  fontSize: 16, fontFamily: "inherit", fontWeight: 600,
                  color: "#171717", outline: "none",
                }}
              />
              <button
                onClick={handleSave}
                disabled={saving}
                style={{ ...iconBtn, color: saving ? "#ccc" : "#00714D" }}
                title="Simpan"
              >
                <Check size={16} />
              </button>
              <button onClick={cancelEdit} style={{ ...iconBtn, color: "#777" }} title="Batal">
                <X size={16} />
              </button>
            </div>
            {error && <p style={{ fontSize: 11, color: "#DA0037", margin: 0 }}>{error}</p>}
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 24, fontWeight: 700, color: "#171717" }}>
              Rp {tariff.toLocaleString("id-ID")}
            </span>
            <span style={{ fontSize: 13, color: "#888" }}>/kWh</span>
            {canWrite && (
              <button onClick={startEdit} style={{ ...iconBtn, color: "#555", marginLeft: 4 }} title="Edit tarif">
                <Pencil size={14} />
              </button>
            )}
          </div>
        )}
      </div>

      <p style={{ fontSize: 11, color: "#9CA3AF", marginTop: 12 }}>
        Contoh: kendaraan dengan kapasitas 82 kWh → biaya charging = 57,4 kWh × Rp {tariff.toLocaleString("id-ID")} ={" "}
        Rp {Math.round(57.4 * tariff).toLocaleString("id-ID")}
      </p>
    </div>
  );
}
