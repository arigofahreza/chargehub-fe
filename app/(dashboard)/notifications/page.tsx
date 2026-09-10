"use client";
import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { fadeUpVariants } from "@/lib/motion";
import { TemplateCard } from "@/components/notifications/TemplateCard";
import { TemplateFormModal } from "@/components/notifications/TemplateFormModal";
import {
  getTemplates, createTemplate, updateTemplate,
  getLogs, downloadLogs,
  type NotificationLog,
} from "@/lib/services/notifications";
import { NotificationTemplate, TemplateStatus } from "@/lib/types";
import { Wave } from "@/components/ui/wave";
import { usePermissions } from "@/hooks/usePermissions";
import { Download, CheckCircle2, XCircle } from "lucide-react";

type Tab = "template" | "log";

const statusChips: { label: string; value: TemplateStatus | "all" }[] = [
  { label: "Semua", value: "all" },
  { label: "Aktif", value: "active" },
  { label: "Draf", value: "inactive" },
];

const CHIP_BASE: React.CSSProperties = {
  borderRadius: 9999,
  fontSize: 12,
  fontWeight: 600,
  padding: "5px 14px",
  border: "1px solid rgba(195,198,215,0.5)",
  background: "#EDEDED",
  color: "var(--color-body)",
  cursor: "pointer",
  fontFamily: "inherit",
  whiteSpace: "nowrap" as const,
};

const CHIP_ACTIVE: React.CSSProperties = {
  background: "var(--color-brand-primary)",
  borderColor: "var(--color-brand-primary)",
  color: "#fff",
};

const tabStyle = (active: boolean): React.CSSProperties => ({
  padding: "7px 18px",
  borderRadius: 9999,
  border: "none",
  fontSize: 13,
  fontWeight: 600,
  fontFamily: "inherit",
  cursor: "pointer",
  background: active ? "#171717" : "transparent",
  color: active ? "#fff" : "#777",
  transition: "background 0.15s, color 0.15s",
});

function formatDateTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "short",
      timeStyle: "short",
      hour12: false,
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function NotificationsPage() {
  const perms = usePermissions();
  const [tab, setTab] = useState<Tab>("template");

  // Template state
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<NotificationTemplate | null>(null);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TemplateStatus | "all">("all");

  // Log state
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logsLoaded, setLogsLoaded] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    setLoadingTemplates(true);
    getTemplates().then((data) => {
      setTemplates(data);
      setLoadingTemplates(false);
    });
  }, []);

  useEffect(() => {
    if (tab === "log" && !logsLoaded) {
      setLoadingLogs(true);
      getLogs()
        .then((data) => { setLogs(data); setLogsLoaded(true); })
        .finally(() => setLoadingLogs(false));
    }
  }, [tab, logsLoaded]);

  const filtered = useMemo(() => {
    return templates.filter((t) => {
      const matchSearch =
        search === "" ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.message.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || t.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [templates, search, statusFilter]);

  async function handleSubmit(data: Partial<NotificationTemplate>) {
    if (editing) {
      const updated = await updateTemplate(editing.id, data);
      if (updated) setTemplates((prev) => prev.map((t) => (t.id === editing.id ? updated : t)));
    } else {
      const created = await createTemplate({
        name: data.name ?? "New Template",
        message: data.message ?? "",
        status: data.status ?? "active",
        employeeCount: 0,
        phoneCount: data.phoneCount ?? 0,
        lastSent: new Date().toISOString(),
        category: data.category ?? "General",
      });
      setTemplates((prev) => [created, ...prev]);
    }
  }

  async function handleDownload() {
    setDownloading(true);
    setDownloadError(null);
    try {
      await downloadLogs();
    } catch (e) {
      setDownloadError(e instanceof Error ? e.message : "Download gagal");
    } finally {
      setDownloading(false);
    }
  }

  const activeCount = templates.filter((t) => t.status === "active").length;

  return (
    <motion.div variants={fadeUpVariants} initial="hidden" animate="visible">
      <main className="p-4 md:p-6 space-y-5">
        {/* Title row */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 style={{ fontWeight: 700, fontSize: 22, color: "#171717", letterSpacing: "-0.4px" }}>
              Notifikasi (WA)
            </h1>
            <p style={{ fontSize: 13, color: "#444444" }}>Kelola template dan riwayat pengiriman WhatsApp.</p>
          </div>
          {tab === "template" && perms.canWriteNotifications && (
            <button
              onClick={() => { setEditing(null); setModalOpen(true); }}
              className="flex items-center gap-1.5 flex-shrink-0"
              style={{
                background: "#DA0037", border: "none", borderRadius: 10,
                color: "#fff", fontSize: 11, fontWeight: 600,
                padding: "9px 14px", fontFamily: "inherit", cursor: "pointer",
              }}
            >
              <span style={{ fontSize: 14, lineHeight: 1 }}>+</span>
              Template Baru
            </button>
          )}
          {tab === "log" && (
            <button
              onClick={handleDownload}
              disabled={downloading || logs.length === 0}
              className="flex items-center gap-1.5 flex-shrink-0"
              style={{
                background: downloading || logs.length === 0 ? "#EDEDED" : "#171717",
                border: "none", borderRadius: 10,
                color: downloading || logs.length === 0 ? "#999" : "#fff",
                fontSize: 11, fontWeight: 600,
                padding: "9px 14px", fontFamily: "inherit",
                cursor: downloading || logs.length === 0 ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              <Download size={13} />
              {downloading ? "Mengunduh..." : "Unduh CSV"}
            </button>
          )}
        </div>

        {downloadError && (
          <p style={{ fontSize: 12, color: "#DA0037", marginTop: -12 }}>{downloadError}</p>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, background: "#F4F5F7", borderRadius: 9999, padding: 4, width: "fit-content" }}>
          <button style={tabStyle(tab === "template")} onClick={() => setTab("template")}>Template</button>
          <button style={tabStyle(tab === "log")} onClick={() => setTab("log")}>Log Pengiriman</button>
        </div>

        {/* ── Template Tab ── */}
        {tab === "template" && (
          <>
            <div style={{
              background: "#fff", border: "1px solid rgba(195,198,215,0.5)",
              borderRadius: 14, padding: 14, display: "flex", flexDirection: "column", gap: 10,
            }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
                  <input
                    type="text"
                    placeholder="Cari template..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                      width: "100%", height: 42, borderRadius: 10,
                      background: "#EDEDED", border: "1px solid rgba(195,198,215,0.5)",
                      padding: "0 14px 0 36px", fontSize: 14, color: "#171717",
                      fontFamily: "inherit", outline: "none",
                    }}
                  />
                  <svg width="15" height="15" viewBox="0 0 18 18" fill="none"
                    style={{ position: "absolute", left: 11, top: 13, pointerEvents: "none" }}>
                    <circle cx="7" cy="7" r="6" stroke="#777777" strokeWidth="2" />
                    <line x1="12" y1="12" x2="17" y2="17" stroke="#777777" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {statusChips.map((c) => {
                    const active = statusFilter === c.value;
                    return (
                      <button key={c.value} onClick={() => setStatusFilter(c.value)}
                        style={{ ...CHIP_BASE, ...(active ? CHIP_ACTIVE : {}) }}>
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {loadingTemplates ? (
              <div className="flex flex-col items-center justify-center py-32 gap-4">
                <Wave className="size-16 text-[#DA0037]" />
                <p className="text-sm" style={{ color: "var(--color-muted-text)" }}>Memuat template...</p>
              </div>
            ) : (
              <>
                <p className="text-xs" style={{ color: "var(--color-muted-text)" }}>
                  {filtered.length} template · {activeCount} aktif
                </p>
                {filtered.length === 0 ? (
                  <div className="text-center py-20 text-sm" style={{ color: "var(--color-muted-text)" }}>
                    Tidak ada template yang sesuai filter.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtered.map((t) => (
                      <TemplateCard key={t.id} template={t}
                        onEdit={() => { setEditing(t); setModalOpen(true); }}
                        canWrite={perms.canWriteNotifications}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ── Log Tab ── */}
        {tab === "log" && (
          <>
            {loadingLogs ? (
              <div className="flex flex-col items-center justify-center py-32 gap-4">
                <Wave className="size-16 text-[#DA0037]" />
                <p className="text-sm" style={{ color: "var(--color-muted-text)" }}>Memuat log...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-20 text-sm" style={{ color: "var(--color-muted-text)" }}>
                Belum ada log pengiriman.
              </div>
            ) : (
              <div style={{
                background: "#fff", border: "1px solid rgba(195,198,215,0.5)",
                borderRadius: 14, overflow: "hidden",
              }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #EDEDED", background: "#FAFAFA" }}>
                        {["Tanggal & Waktu", "Nomor Tujuan", "Pesan", "Template", "Status"].map((h) => (
                          <th key={h} style={{
                            textAlign: "left", padding: "10px 14px",
                            fontWeight: 600, color: "#777", fontSize: 11, whiteSpace: "nowrap",
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => (
                        <tr key={log.id} style={{ borderBottom: "1px solid rgba(195,198,215,0.3)" }}>
                          <td style={{ padding: "10px 14px", color: "#555", whiteSpace: "nowrap", fontSize: 12 }}>
                            {formatDateTime(log.sentAt)}
                          </td>
                          <td style={{ padding: "10px 14px", fontWeight: 500, color: "#171717", whiteSpace: "nowrap" }}>
                            {log.toPhone}
                          </td>
                          <td style={{ padding: "10px 14px", color: "#444", maxWidth: 280 }}>
                            <span style={{
                              display: "-webkit-box", WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical", overflow: "hidden",
                              lineHeight: "1.4",
                            }}>
                              {log.message}
                            </span>
                          </td>
                          <td style={{ padding: "10px 14px", color: "#777", fontSize: 12, whiteSpace: "nowrap" }}>
                            {log.templateName ?? "—"}
                          </td>
                          <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
                            {log.status === "sent" ? (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 5,
                                color: "#00714D", fontSize: 12, fontWeight: 600 }}>
                                <CheckCircle2 size={13} />
                                Terkirim
                              </span>
                            ) : (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 5,
                                color: "#DA0037", fontSize: 12, fontWeight: 600 }}>
                                <XCircle size={13} />
                                Gagal
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ padding: "10px 14px", borderTop: "1px solid #EDEDED" }}>
                  <p style={{ fontSize: 12, color: "#999" }}>{logs.length} entri log</p>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <TemplateFormModal
        open={modalOpen}
        onOpenChange={(o) => { setModalOpen(o); if (!o) setEditing(null); }}
        initial={editing ?? undefined}
        mode={editing ? "edit" : "add"}
        onSubmit={handleSubmit}
      />
    </motion.div>
  );
}
