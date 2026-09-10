"use client";
import { useState } from "react";
import { Trash2, Pencil, Check, X, Plus } from "lucide-react";
import type { BatteryDrainRate, ActivityCategory } from "@/lib/services/management";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";

interface Props {
  rates: BatteryDrainRate[];
  activityCategories: ActivityCategory[];
  onAdd: (activityId: string, persenPenurunan: number) => Promise<void>;
  onEdit: (id: string, persenPenurunan: number) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const iconBtn: React.CSSProperties = {
  background: "none", border: "none", cursor: "pointer",
  padding: 4, borderRadius: 6, display: "flex", alignItems: "center",
};

const thStyle: React.CSSProperties = {
  textAlign: "left", padding: "8px 12px",
  fontWeight: 600, color: "#777", fontSize: 11,
  whiteSpace: "nowrap", borderBottom: "1px solid #EDEDED",
};

export function BatteryDrainRateList({ rates, activityCategories, onAdd, onEdit, onDelete }: Props) {
  const [newActivityId, setNewActivityId] = useState("");
  const [newPersen, setNewPersen] = useState("");
  const [adding, setAdding] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPersen, setEditPersen] = useState("");
  const [saving, setSaving] = useState(false);

  const [pendingRate, setPendingRate] = useState<BatteryDrainRate | null>(null);

  async function handleAdd() {
    const persen = parseFloat(newPersen);
    if (!newActivityId || isNaN(persen) || persen <= 0 || persen > 100) return;
    setAdding(true);
    try {
      await onAdd(newActivityId, persen);
      setNewActivityId("");
      setNewPersen("");
    } finally {
      setAdding(false);
    }
  }

  function startEdit(r: BatteryDrainRate) {
    setEditingId(r.id);
    setEditPersen(String(r.persenPenurunan));
  }

  function cancelEdit() {
    setEditingId(null);
    setEditPersen("");
  }

  async function handleSaveEdit(id: string) {
    const persen = parseFloat(editPersen);
    if (isNaN(persen) || persen <= 0 || persen > 100) return;
    setSaving(true);
    try {
      await onEdit(id, persen);
      setEditingId(null);
    } finally {
      setSaving(false);
    }
  }

  const usedActivityIds = new Set(rates.map((r) => r.activityId));
  const availableActivities = activityCategories.filter((a) => !usedActivityIds.has(a.id));

  return (
    <>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Aktivitas</th>
              <th style={thStyle}>Persen Penurunan (%)</th>
              <th style={{ ...thStyle, width: 72 }} />
            </tr>
          </thead>
          <tbody>
            {rates.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: "20px 12px", textAlign: "center", color: "#9CA3AF", fontSize: 13 }}>
                  Belum ada data
                </td>
              </tr>
            )}
            {rates.map((r) => (
              <tr key={r.id} style={{ borderBottom: "1px solid rgba(195,198,215,0.3)" }}>
                <td style={{ padding: "10px 12px", color: "#888", fontSize: 11, fontFamily: "monospace" }}>
                  {r.id.slice(0, 8)}…
                </td>
                <td style={{ padding: "10px 12px", fontWeight: 500, color: "#171717" }}>
                  {r.activityName}
                </td>
                <td style={{ padding: "10px 12px", minWidth: 160 }}>
                  {editingId === r.id ? (
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <input
                        type="number"
                        min={0.1}
                        max={100}
                        step={0.1}
                        value={editPersen}
                        onChange={(e) => setEditPersen(e.target.value)}
                        autoFocus
                        style={{
                          height: 32, borderRadius: 8, border: "1px solid #DA0037",
                          padding: "0 8px", fontSize: 13, fontFamily: "inherit",
                          color: "#171717", outline: "none", width: 80,
                        }}
                      />
                      <span style={{ fontSize: 12, color: "#555" }}>%</span>
                      <button
                        onClick={() => handleSaveEdit(r.id)}
                        disabled={saving}
                        style={{ ...iconBtn, color: saving ? "#ccc" : "#00714D" }}
                      >
                        <Check size={14} />
                      </button>
                      <button onClick={cancelEdit} style={{ ...iconBtn, color: "#777" }}>
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <span style={{ color: "#171717", fontWeight: 500 }}>{r.persenPenurunan}%</span>
                  )}
                </td>
                <td style={{ padding: "10px 12px" }}>
                  {editingId !== r.id && (
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={() => startEdit(r)} style={{ ...iconBtn, color: "#555" }}>
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => setPendingRate(r)} style={{ ...iconBtn, color: "#DA0037" }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add row */}
      <div style={{ display: "flex", gap: 8, marginTop: 16, alignItems: "flex-end", flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: "#777" }}>AKTIVITAS</label>
          <select
            value={newActivityId}
            onChange={(e) => setNewActivityId(e.target.value)}
            style={{
              height: 40, borderRadius: 10, background: "#fff",
              border: "1px solid #DEDEDE", padding: "0 12px",
              fontSize: 13, fontFamily: "inherit", color: newActivityId ? "#171717" : "#9CA3AF",
              outline: "none", minWidth: 180,
            }}
          >
            <option value="" disabled>pilih aktivitas...</option>
            {availableActivities.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: "#777" }}>PERSEN PENURUNAN (%)</label>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <input
              type="number"
              min={0.1}
              max={100}
              step={0.1}
              placeholder="0.0"
              value={newPersen}
              onChange={(e) => setNewPersen(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              style={{
                height: 40, borderRadius: 10, background: "#fff",
                border: "1px solid #DEDEDE", padding: "0 12px",
                fontSize: 13, fontFamily: "inherit", color: "#171717",
                outline: "none", width: 90,
              }}
            />
            <span style={{ fontSize: 13, color: "#555" }}>%</span>
          </div>
        </div>
        <button
          onClick={handleAdd}
          disabled={!newActivityId || !newPersen || isNaN(parseFloat(newPersen)) || parseFloat(newPersen) <= 0 || adding}
          style={{
            height: 40, borderRadius: 10, background: "#DA0037", border: "none",
            color: "#fff", fontWeight: 600, fontSize: 12, fontFamily: "inherit",
            cursor: "pointer", padding: "0 16px", display: "flex", alignItems: "center", gap: 4,
            opacity: !newActivityId || !newPersen || isNaN(parseFloat(newPersen)) || parseFloat(newPersen) <= 0 || adding ? 0.45 : 1,
          }}
        >
          <Plus size={14} />
          Tambah
        </button>
      </div>

      <ConfirmDeleteModal
        open={!!pendingRate}
        title={`Hapus penurunan baterai "${pendingRate?.activityName ?? ""}"?`}
        message="Data akan dihapus permanen dan tidak dapat dikembalikan."
        onConfirm={async () => {
          if (pendingRate) await onDelete(pendingRate.id);
          setPendingRate(null);
        }}
        onCancel={() => setPendingRate(null)}
      />
    </>
  );
}
