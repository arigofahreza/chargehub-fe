"use client";
import { useState } from "react";
import { Trash2, Plus, Pencil, Check, X } from "lucide-react";
import type { Category } from "@/lib/services/management";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";

interface Props {
  categories: Category[];
  onAdd: (name: string) => Promise<void>;
  onEdit: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  placeholder?: string;
}

export function CategoryList({ categories, onAdd, onEdit, onDelete, placeholder = "Nama kategori baru..." }: Props) {
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [pendingCat, setPendingCat] = useState<Category | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    const name = newName.trim();
    if (!name) return;
    setAdding(true);
    try {
      await onAdd(name);
      setNewName("");
    } finally {
      setAdding(false);
    }
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setEditName(cat.name);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
  }

  async function handleSaveEdit(id: string) {
    const name = editName.trim();
    if (!name) return;
    setSaving(true);
    try {
      await onEdit(id, name);
      setEditingId(null);
    } finally {
      setSaving(false);
    }
  }

  const iconBtn: React.CSSProperties = {
    background: "none", border: "none", cursor: "pointer",
    padding: 4, borderRadius: 6, display: "flex", alignItems: "center",
  };

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {categories.length === 0 && (
          <p style={{ fontSize: 13, color: "#9CA3AF", textAlign: "center", padding: "16px 0" }}>Belum ada kategori</p>
        )}
        {categories.map((c) =>
          editingId === c.id ? (
            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, background: "#F9F9F9", borderRadius: 10, padding: "8px 14px", border: "1px solid #DA0037" }}>
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveEdit(c.id);
                  if (e.key === "Escape") cancelEdit();
                }}
                autoFocus
                style={{
                  flex: 1, height: 32, borderRadius: 8, border: "1px solid #DEDEDE",
                  padding: "0 10px", fontSize: 13, fontFamily: "inherit",
                  color: "#171717", outline: "none",
                }}
              />
              <button
                onClick={() => handleSaveEdit(c.id)}
                disabled={!editName.trim() || saving}
                style={{ ...iconBtn, color: saving ? "#ccc" : "#00714D" }}
              >
                <Check size={15} />
              </button>
              <button onClick={cancelEdit} style={{ ...iconBtn, color: "#777" }}>
                <X size={15} />
              </button>
            </div>
          ) : (
            <div key={c.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#F9F9F9", borderRadius: 10, padding: "10px 14px", border: "1px solid rgba(195,198,215,0.4)" }}>
              <span style={{ fontSize: 13, color: "#171717", fontWeight: 500 }}>{c.name}</span>
              <div style={{ display: "flex", gap: 2 }}>
                <button onClick={() => startEdit(c)} style={{ ...iconBtn, color: "#555" }}>
                  <Pencil size={13} />
                </button>
                <button onClick={() => setPendingCat(c)} style={{ ...iconBtn, color: "#DA0037" }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )
        )}
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={placeholder}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            style={{
              height: 40, borderRadius: 10, background: "#fff",
              border: "1px solid #DEDEDE", padding: "0 12px",
              fontSize: 13, fontFamily: "inherit", color: "#171717",
              outline: "none", flex: 1,
            }}
          />
          <button
            onClick={handleAdd}
            disabled={!newName.trim() || adding}
            style={{
              height: 40, borderRadius: 10, background: "#DA0037", border: "none",
              color: "#fff", fontWeight: 600, fontSize: 12, fontFamily: "inherit",
              cursor: newName.trim() && !adding ? "pointer" : "not-allowed",
              opacity: newName.trim() && !adding ? 1 : 0.45,
              padding: "0 16px", display: "flex", alignItems: "center", gap: 4,
            }}
          >
            <Plus size={14} />
            Tambah
          </button>
        </div>
      </div>

      <ConfirmDeleteModal
        open={!!pendingCat}
        title={`Hapus kategori "${pendingCat?.name ?? ""}"?`}
        message="Kategori akan dihapus permanen dan tidak dapat dikembalikan."
        onConfirm={async () => {
          if (pendingCat) await onDelete(pendingCat.id);
          setPendingCat(null);
        }}
        onCancel={() => setPendingCat(null)}
      />
    </>
  );
}
