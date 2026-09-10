"use client";
import { useState, useMemo } from "react";
import { Trash2, Pencil, Check, X, ChevronUp, ChevronDown, ChevronsUpDown, UserPlus } from "lucide-react";
import type { AdminUser, EmployeeCategory } from "@/lib/services/management";
import { getRoleLabel } from "@/lib/rbac";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";

type SortKey = "fullName" | "username" | "role";
type SortDir = "asc" | "desc";

interface Props {
  users: AdminUser[];
  currentUserId: string;
  currentUserRole: string;
  employeeCategories: EmployeeCategory[];
  onRoleChange: (userId: string, roleCategoryId: string) => Promise<void>;
  onDelete: (userId: string) => Promise<void>;
  onAddUser?: () => void;
}

export function UserTable({ users, currentUserId, currentUserRole, employeeCategories, onRoleChange, onDelete, onAddUser }: Props) {
  const [saving, setSaving] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCategoryId, setEditCategoryId] = useState("");
  const [pendingUser, setPendingUser] = useState<AdminUser | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("fullName");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const isAdmin = currentUserRole === "admin";

  const sorted = useMemo(() => {
    return [...users].sort((a, b) => {
      const av = (sortKey === "fullName" ? (a.fullName || a.username) : sortKey === "role" ? getRoleLabel(a.role) : a[sortKey]).toLowerCase();
      const bv = (sortKey === "fullName" ? (b.fullName || b.username) : sortKey === "role" ? getRoleLabel(b.role) : b[sortKey]).toLowerCase();
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [users, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  const iconBtn: React.CSSProperties = {
    background: "none", border: "none", cursor: "pointer",
    padding: 4, borderRadius: 6, display: "flex", alignItems: "center",
  };

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronsUpDown size={11} style={{ opacity: 0.3 }} />;
    return sortDir === "asc"
      ? <ChevronUp size={11} style={{ color: "#DA0037" }} />
      : <ChevronDown size={11} style={{ color: "#DA0037" }} />;
  }

  const thStyle = (col: SortKey): React.CSSProperties => ({
    textAlign: "left",
    padding: "8px 12px",
    fontWeight: 600,
    color: sortKey === col ? "#DA0037" : "#777",
    fontSize: 11,
    cursor: "pointer",
    userSelect: "none",
    whiteSpace: "nowrap",
  });

  function startEdit(u: AdminUser) {
    setEditingId(u.id);
    setEditCategoryId(u.roleCategoryId ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditCategoryId("");
  }

  async function handleSaveEdit(userId: string) {
    if (!editCategoryId) return;
    setSaving(userId);
    try {
      await onRoleChange(userId, editCategoryId);
      setEditingId(null);
    } finally {
      setSaving(null);
    }
  }

  return (
    <>
      {isAdmin && onAddUser && (
        <div style={{ marginBottom: 16, display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={onAddUser}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              height: 36, padding: "0 14px", borderRadius: 8,
              background: "var(--color-brand-primary)", border: "none",
              color: "#fff", fontSize: 13, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            <UserPlus size={14} />
            Tambah Pengguna
          </button>
        </div>
      )}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #EDEDED" }}>
              <th style={thStyle("fullName")} onClick={() => handleSort("fullName")}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  Nama <SortIcon col="fullName" />
                </span>
              </th>
              <th style={thStyle("username")} onClick={() => handleSort("username")}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  Username <SortIcon col="username" />
                </span>
              </th>
              <th style={thStyle("role")} onClick={() => handleSort("role")}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  Role <SortIcon col="role" />
                </span>
              </th>
              {isAdmin && <th style={{ padding: "8px 12px" }} />}
            </tr>
          </thead>
          <tbody>
            {sorted.map((u) => (
              <tr key={u.id} style={{ borderBottom: "1px solid rgba(195,198,215,0.3)" }}>
                <td style={{ padding: "10px 12px", fontWeight: 500, color: "#171717" }}>{u.fullName || u.username}</td>
                <td style={{ padding: "10px 12px", color: "#444" }}>{u.username}</td>
                <td style={{ padding: "10px 12px", minWidth: 180 }}>
                  {editingId === u.id ? (
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <select
                        value={editCategoryId}
                        onChange={(e) => setEditCategoryId(e.target.value)}
                        style={{
                          height: 34, borderRadius: 8, background: "#fff",
                          border: "1px solid #DA0037", padding: "0 8px",
                          fontSize: 12, fontFamily: "inherit", color: "#171717", outline: "none", flex: 1,
                        }}
                      >
                        <option value="">Pilih kategori...</option>
                        {employeeCategories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleSaveEdit(u.id)}
                        disabled={!editCategoryId || saving === u.id}
                        style={{ ...iconBtn, color: saving === u.id || !editCategoryId ? "#ccc" : "#00714D" }}
                      >
                        <Check size={14} />
                      </button>
                      <button onClick={cancelEdit} style={{ ...iconBtn, color: "#777" }}>
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <span style={{ fontSize: 12, color: "#555" }}>
                      {getRoleLabel(u.role)}{u.id === currentUserId ? " (kamu)" : ""}
                    </span>
                  )}
                </td>
                {isAdmin && (
                  <td style={{ padding: "10px 12px" }}>
                    {u.id !== currentUserId && editingId !== u.id && (
                      <div style={{ display: "flex", gap: 4 }}>
                        <button onClick={() => startEdit(u)} style={{ ...iconBtn, color: "#555" }}>
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => setPendingUser(u)} style={{ ...iconBtn, color: "#DA0037" }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDeleteModal
        open={!!pendingUser}
        title={`Hapus user "${pendingUser?.username ?? ""}"?`}
        message="Akun user akan dihapus permanen dan tidak dapat dikembalikan."
        onConfirm={async () => {
          if (pendingUser) await onDelete(pendingUser.id);
          setPendingUser(null);
        }}
        onCancel={() => setPendingUser(null)}
      />
    </>
  );
}
