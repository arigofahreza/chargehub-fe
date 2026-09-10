"use client";
import { useRef, useState } from "react";
import { Trash2, Upload, Pencil, Check, X } from "lucide-react";
import type { ActivityCategory } from "@/lib/services/management";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";

interface Props {
  categories: ActivityCategory[];
  onAdd: (name: string, iconFile: File) => Promise<void>;
  onEdit: (id: string, name: string, iconFile?: File) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  canWrite?: boolean;
}

const ACCEPTED = "image/png,image/jpeg,image/webp,image/svg+xml";
const MAX_SIZE = 2 * 1024 * 1024;

interface EditState {
  id: string;
  name: string;
  iconFile: File | null;
  iconPreview: string | null;
}

export function ActivityCategoryList({ categories, onAdd, onEdit, onDelete, canWrite = true }: Props) {
  const [name, setName] = useState("");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingCat, setPendingCat] = useState<ActivityCategory | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const editFileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_SIZE) { setError("Ukuran file maks 2 MB"); return; }
    if (!file.type.startsWith("image/")) { setError("File harus berupa gambar"); return; }
    setError(null);
    setIconFile(file);
    setIconPreview(URL.createObjectURL(file));
  }

  function clearIcon() {
    if (iconPreview) URL.revokeObjectURL(iconPreview);
    setIconFile(null);
    setIconPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleEditFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editState) return;
    if (file.size > MAX_SIZE) { setError("Ukuran file maks 2 MB"); return; }
    if (!file.type.startsWith("image/")) { setError("File harus berupa gambar"); return; }
    setError(null);
    const preview = URL.createObjectURL(file);
    setEditState((s) => s ? { ...s, iconFile: file, iconPreview: preview } : s);
  }

  function startEdit(cat: ActivityCategory) {
    setError(null);
    setEditState({ id: cat.id, name: cat.name, iconFile: null, iconPreview: null });
  }

  function cancelEdit() {
    if (editState?.iconPreview) URL.revokeObjectURL(editState.iconPreview);
    setEditState(null);
    setError(null);
    if (editFileRef.current) editFileRef.current.value = "";
  }

  async function handleSaveEdit() {
    if (!editState) return;
    const trimmed = editState.name.trim();
    if (!trimmed) return;
    setSaving(true);
    setError(null);
    try {
      await onEdit(editState.id, trimmed, editState.iconFile ?? undefined);
      cancelEdit();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  async function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed || !iconFile) return;
    setAdding(true);
    setError(null);
    try {
      await onAdd(trimmed, iconFile);
      setName("");
      clearIcon();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menambah kategori");
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  }

  const canSubmit = !!name.trim() && !!iconFile && !adding;

  const iconBtn: React.CSSProperties = {
    border: "none", background: "none", padding: 6, borderRadius: 6,
    display: "flex", alignItems: "center", cursor: "pointer",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* List */}
      {categories.length === 0 ? (
        <p style={{ fontSize: 13, color: "#888", padding: "12px 0" }}>Belum ada kategori aktivitas.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {categories.map((cat) =>
            editState?.id === cat.id ? (
              /* Edit row */
              <div
                key={cat.id}
                style={{
                  display: "flex", flexDirection: "column", gap: 8,
                  padding: "10px 12px", borderRadius: 10,
                  background: "#F9F9F9", border: "1px solid #DA0037",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {/* Icon preview */}
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: "#EDEDED", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                    {editState.iconPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={editState.iconPreview} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    ) : cat.icon_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cat.icon_url} alt={cat.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    ) : (
                      <span style={{ fontSize: 18 }}>⚡</span>
                    )}
                  </div>
                  <input
                    value={editState.name}
                    onChange={(e) => setEditState((s) => s ? { ...s, name: e.target.value } : s)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveEdit();
                      if (e.key === "Escape") cancelEdit();
                    }}
                    autoFocus
                    style={{
                      flex: 1, height: 32, borderRadius: 8, border: "1px solid #DEDEDE",
                      padding: "0 10px", fontSize: 13, fontFamily: "inherit",
                      color: "#171717", outline: "none",
                    }}
                  />
                  <button onClick={handleSaveEdit} disabled={!editState.name.trim() || saving} style={{ ...iconBtn, color: saving ? "#ccc" : "#00714D" }}>
                    <Check size={15} />
                  </button>
                  <button onClick={cancelEdit} style={{ ...iconBtn, color: "#777" }}>
                    <X size={15} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => editFileRef.current?.click()}
                  style={{
                    display: "flex", alignItems: "center", gap: 6, height: 30,
                    borderRadius: 8, border: "1px dashed #DEDEDE", background: "#fff",
                    color: "#555", fontSize: 11, fontFamily: "inherit", cursor: "pointer",
                    padding: "0 10px",
                  }}
                >
                  <Upload size={11} />
                  {editState.iconFile ? editState.iconFile.name : "Ganti icon (opsional)"}
                </button>
                <input ref={editFileRef} type="file" accept={ACCEPTED} style={{ display: "none" }} onChange={handleEditFileChange} />
                {error && <p style={{ fontSize: 11, color: "#DA0037", margin: 0 }}>{error}</p>}
              </div>
            ) : (
              /* Normal row */
              <div
                key={cat.id}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 12px", borderRadius: 10,
                  background: "#F9F9F9", border: "1px solid rgba(195,198,215,0.4)",
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "#EDEDED", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                  {cat.icon_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cat.icon_url} alt={cat.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  ) : (
                    <span style={{ fontSize: 18 }}>⚡</span>
                  )}
                </div>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: "#171717" }}>{cat.name}</span>
                {canWrite && (
                  <div style={{ display: "flex", gap: 2 }}>
                    <button onClick={() => startEdit(cat)} style={{ ...iconBtn, color: "#555" }}>
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => setPendingCat(cat)}
                      disabled={deletingId === cat.id}
                      style={{ ...iconBtn, color: deletingId === cat.id ? "#ccc" : "#DA0037", cursor: deletingId === cat.id ? "not-allowed" : "pointer" }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      )}

      <ConfirmDeleteModal
        open={!!pendingCat}
        title={`Hapus kategori "${pendingCat?.name ?? ""}"?`}
        message="Kategori aktivitas akan dihapus permanen dan tidak dapat dikembalikan."
        onConfirm={async () => {
          if (pendingCat) await handleDelete(pendingCat.id);
          setPendingCat(null);
        }}
        onCancel={() => setPendingCat(null)}
      />

      {/* Add form */}
      {canWrite && (
        <div
          style={{
            display: "flex", flexDirection: "column", gap: 8,
            padding: "12px 14px", borderRadius: 10,
            border: "1px dashed rgba(195,198,215,0.7)", background: "#FAFAFA",
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Tambah Kategori Baru
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
            placeholder="Nama kategori..."
            style={{
              height: 38, borderRadius: 8, border: "1px solid #DEDEDE",
              padding: "0 10px", fontSize: 13, fontFamily: "inherit",
              outline: "none", color: "#171717",
            }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {iconPreview ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={iconPreview} alt="preview" style={{ width: 36, height: 36, objectFit: "contain", borderRadius: 8, border: "1px solid #DEDEDE", background: "#EDEDED" }} />
                <span style={{ fontSize: 12, color: "#555", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{iconFile?.name}</span>
                <button type="button" onClick={clearIcon} style={{ border: "none", background: "none", color: "#DA0037", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", padding: "2px 6px" }}>Hapus</button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                style={{
                  display: "flex", alignItems: "center", gap: 6, height: 36,
                  borderRadius: 8, border: "1px solid #DEDEDE", background: "#fff",
                  color: "#555", fontSize: 12, fontWeight: 500, fontFamily: "inherit",
                  cursor: "pointer", padding: "0 12px", flex: 1,
                }}
              >
                <Upload size={13} />
                Pilih Icon <span style={{ color: "#DA0037" }}>*</span>
              </button>
            )}
            <input ref={fileRef} type="file" accept={ACCEPTED} style={{ display: "none" }} onChange={handleFileChange} />
          </div>
          {error && !editState && <p style={{ fontSize: 11, color: "#DA0037", margin: 0 }}>{error}</p>}
          <button
            onClick={handleAdd}
            disabled={!canSubmit}
            style={{
              height: 36, borderRadius: 8, background: canSubmit ? "#DA0037" : "#ccc",
              border: "none", color: "#fff", fontSize: 12, fontWeight: 600,
              fontFamily: "inherit", cursor: canSubmit ? "pointer" : "not-allowed",
              transition: "background 0.15s ease",
            }}
          >
            {adding ? "Menyimpan..." : "Tambah"}
          </button>
        </div>
      )}
    </div>
  );
}
