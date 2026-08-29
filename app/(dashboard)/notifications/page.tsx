"use client";
import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { fadeUpVariants } from "@/lib/motion";
import { TemplateCard } from "@/components/notifications/TemplateCard";
import { TemplateFormModal } from "@/components/notifications/TemplateFormModal";
import { getTemplates, createTemplate, updateTemplate } from "@/lib/services/notifications";
import { getEmployees } from "@/lib/services/employees";
import { NotificationTemplate, Employee, TemplateStatus } from "@/lib/types";
import { Wave } from "@/components/ui/wave";
import { useAuthStore } from "@/stores/useAuthStore";

const statusChips: { label: string; value: TemplateStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Draft", value: "inactive" },
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

export default function NotificationsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (user && user.role !== "admin") router.replace("/dashboard");
  }, [user, router]);

  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<NotificationTemplate | null>(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TemplateStatus | "all">("all");

  useEffect(() => {
    setLoading(true);
    Promise.all([getTemplates(), getEmployees()]).then(([data, emps]) => {
      setTemplates(data);
      setEmployees(emps);
      setLoading(false);
    });
  }, []);

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
    const rids = data.recipientIds ?? [];
    if (editing) {
      const updated = await updateTemplate(editing.id, {
        ...data,
        recipientIds: rids,
      });
      if (updated) setTemplates((prev) => prev.map((t) => (t.id === editing.id ? updated : t)));
    } else {
      const created = await createTemplate({
        name: data.name ?? "New Template",
        message: data.message ?? "",
        status: data.status ?? "active",
        employeeCount: rids.length,
        phoneCount: rids.length,
        lastSent: new Date().toISOString(),
        category: data.category ?? "General",
        recipientIds: rids,
      });
      setTemplates((prev) => [created, ...prev]);
    }
  }

  function handleEdit(template: NotificationTemplate) {
    setEditing(template);
    setModalOpen(true);
  }

  function handleAdd() {
    setEditing(null);
    setModalOpen(true);
  }

  const activeCount = templates.filter((t) => t.status === "active").length;

  if (user?.role !== "admin") return null;

  return (
    <motion.div variants={fadeUpVariants} initial="hidden" animate="visible">
      <main className="p-4 md:p-6 space-y-5">
        {/* Title row */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 style={{ fontWeight: 700, fontSize: 22, color: "#171717", letterSpacing: "-0.4px" }}>
              Notifications (WA)
            </h1>
            <p style={{ fontSize: 13, color: "#444444" }}>Manage WhatsApp broadcast templates.</p>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-1.5 flex-shrink-0"
            style={{
              background: "#DA0037",
              border: "none",
              borderRadius: 10,
              color: "#fff",
              fontSize: 11,
              fontWeight: 600,
              padding: "9px 14px",
              fontFamily: "inherit",
              cursor: "pointer",
            }}
          >
            <span style={{ fontSize: 14, lineHeight: 1 }}>+</span>
            New Template
          </button>
        </div>

        {/* Filter card */}
        <div
          style={{
            background: "#fff",
            border: "1px solid rgba(195,198,215,0.5)",
            borderRadius: 14,
            padding: 14,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {/* Search + status row */}
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
              <input
                type="text"
                placeholder="Search templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  height: 42,
                  borderRadius: 10,
                  background: "#EDEDED",
                  border: "1px solid rgba(195,198,215,0.5)",
                  padding: "0 14px 0 36px",
                  fontSize: 14,
                  color: "#171717",
                  fontFamily: "inherit",
                  outline: "none",
                }}
              />
              <svg
                width="15"
                height="15"
                viewBox="0 0 18 18"
                fill="none"
                style={{ position: "absolute", left: 11, top: 13, pointerEvents: "none" }}
              >
                <circle cx="7" cy="7" r="6" stroke="#777777" strokeWidth="2" />
                <line x1="12" y1="12" x2="17" y2="17" stroke="#777777" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex gap-2 flex-wrap">
              {statusChips.map((c) => {
                const active = statusFilter === c.value;
                return (
                  <button
                    key={c.value}
                    onClick={() => setStatusFilter(c.value)}
                    style={{ ...CHIP_BASE, ...(active ? CHIP_ACTIVE : {}) }}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Wave className="size-16 text-[#DA0037]" />
            <p className="text-sm" style={{ color: "var(--color-muted-text)" }}>Loading templates...</p>
          </div>
        ) : (
          <>
            <p className="text-xs" style={{ color: "var(--color-muted-text)" }}>
              {filtered.length} template{filtered.length !== 1 ? "s" : ""} · {activeCount} active
            </p>
            {filtered.length === 0 ? (
              <div className="text-center py-20 text-sm" style={{ color: "var(--color-muted-text)" }}>
                No templates match your filters.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map((t) => (
                  <TemplateCard
                    key={t.id}
                    template={t}
                    onEdit={() => handleEdit(t)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <TemplateFormModal
        open={modalOpen}
        onOpenChange={(o) => {
          setModalOpen(o);
          if (!o) setEditing(null);
        }}
        initial={editing ?? undefined}
        mode={editing ? "edit" : "add"}
        onSubmit={handleSubmit}
        employees={employees}
      />
    </motion.div>
  );
}
