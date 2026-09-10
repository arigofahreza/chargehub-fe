"use client";
import { useState } from "react";
import { RefreshCw, Copy, Check } from "lucide-react";
import type { EmployeeTokenInfo } from "@/lib/services/management";

interface Props {
  employees: EmployeeTokenInfo[];
  onRefreshToken: (employeeId: string) => Promise<void>;
}

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "8px 12px",
  fontWeight: 600,
  color: "#777",
  fontSize: 11,
  whiteSpace: "nowrap",
  borderBottom: "1px solid #EDEDED",
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }

  return (
    <button
      onClick={handleCopy}
      title="Salin token"
      style={{
        background: "none", border: "none", cursor: "pointer",
        padding: 3, borderRadius: 5, display: "flex", alignItems: "center",
        color: copied ? "#00714D" : "#888",
        transition: "color 0.15s",
      }}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
}

export function TelegramTokenTable({ employees, onRefreshToken }: Props) {
  const [refreshing, setRefreshing] = useState<string | null>(null);

  async function handleRefresh(id: string) {
    setRefreshing(id);
    try {
      await onRefreshToken(id);
    } finally {
      setRefreshing(null);
    }
  }

  return (
    <div>
      {/* Instructions */}
      <div style={{
        background: "#F0F9FF", border: "1px solid #BAE6FD",
        borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "#0369A1",
      }}>
        <strong>Cara kerja:</strong> Generate token per karyawan → berikan token ke karyawan → karyawan chat ke bot Telegram dengan <code style={{ background: "#E0F2FE", padding: "1px 5px", borderRadius: 4 }}>/subscribe TOKEN</code>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              <th style={thStyle}>Nama</th>
              <th style={thStyle}>No. HP</th>
              <th style={thStyle}>Token</th>
              <th style={thStyle}>Status</th>
              <th style={{ ...thStyle, width: 80 }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: "20px 12px", textAlign: "center", color: "#9CA3AF", fontSize: 13 }}>
                  Belum ada karyawan
                </td>
              </tr>
            )}
            {employees.map((emp) => (
              <tr key={emp.id} style={{ borderBottom: "1px solid rgba(195,198,215,0.3)" }}>
                <td style={{ padding: "10px 12px", fontWeight: 500, color: "#171717" }}>
                  {emp.name}
                </td>
                <td style={{ padding: "10px 12px", color: "#555", fontSize: 12 }}>
                  {emp.phone}
                </td>
                <td style={{ padding: "10px 12px" }}>
                  {emp.subscribeToken ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <code style={{
                        background: "#F4F5F7", padding: "3px 8px",
                        borderRadius: 6, fontSize: 12, fontFamily: "monospace",
                        letterSpacing: "2px", color: "#171717", border: "1px solid #EDEDED",
                        userSelect: "all",
                      }}>
                        {emp.subscribeToken}
                      </code>
                      <CopyButton text={emp.subscribeToken} />
                    </div>
                  ) : (
                    <span style={{ color: "#9CA3AF", fontSize: 12 }}>— belum di-generate</span>
                  )}
                </td>
                <td style={{ padding: "10px 12px" }}>
                  {emp.subscribed ? (
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      background: "#F0FDF4", color: "#166534",
                      border: "1px solid #BBF7D0", borderRadius: 9999,
                      fontSize: 11, fontWeight: 600, padding: "2px 9px",
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: 9999, background: "#22C55E", display: "inline-block" }} />
                      Terhubung
                    </span>
                  ) : (
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      background: "#F9F9F9", color: "#888",
                      border: "1px solid #EDEDED", borderRadius: 9999,
                      fontSize: 11, fontWeight: 600, padding: "2px 9px",
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: 9999, background: "#D1D5DB", display: "inline-block" }} />
                      Belum
                    </span>
                  )}
                </td>
                <td style={{ padding: "10px 12px" }}>
                  <button
                    onClick={() => handleRefresh(emp.id)}
                    disabled={refreshing === emp.id}
                    title="Generate token baru"
                    style={{
                      display: "flex", alignItems: "center", gap: 5,
                      height: 32, padding: "0 10px", borderRadius: 8,
                      background: "#F4F5F7", border: "1px solid #EDEDED",
                      fontSize: 11, fontWeight: 600, color: "#555",
                      cursor: refreshing === emp.id ? "not-allowed" : "pointer",
                      fontFamily: "inherit", opacity: refreshing === emp.id ? 0.6 : 1,
                    }}
                  >
                    <RefreshCw size={12} style={{ animation: refreshing === emp.id ? "spin 0.8s linear infinite" : "none" }} />
                    Token
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
