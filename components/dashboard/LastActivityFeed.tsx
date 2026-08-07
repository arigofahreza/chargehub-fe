"use client";
import { useRouter } from "next/navigation";
import { ActivityLog } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";

interface LastActivityFeedProps {
  logs: ActivityLog[];
}

const statusColors: Record<string, { bg: string; text: string }> = {
  completed: { bg: "rgba(0,113,77,0.1)", text: "var(--color-success)" },
  "in-progress": { bg: "rgba(37,99,235,0.1)", text: "var(--color-brand-accent)" },
  pending: { bg: "rgba(122,62,0,0.1)", text: "var(--color-warning)" },
};

export function LastActivityFeed({ logs }: LastActivityFeedProps) {
  const router = useRouter();
  return (
    <div
      className="bg-white p-4"
      style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-card)" }}
    >
      <h3
        className="text-sm font-bold mb-3"
        style={{ color: "var(--color-ink)" }}
      >
        Last Activity
      </h3>
      <div className="space-y-0">
        {logs.slice(0, 2).map((log) => {
          const colors = statusColors[log.status] ?? statusColors.pending;
          return (
            <div
              key={log.id}
              className="flex items-center justify-between py-2.5"
              style={{ borderBottom: "1px solid var(--color-border-ch)" }}
            >
              <div>
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--color-ink)" }}
                >
                  {log.vehicleName}
                </p>
                <p className="text-xs" style={{ color: "var(--color-muted-text)" }}>
                  {log.serviceType} · {formatDateTime(log.dateTime)}
                </p>
              </div>
              <span
                className="text-xs font-semibold px-2 py-0.5"
                style={{
                  backgroundColor: colors.bg,
                  color: colors.text,
                  borderRadius: "9999px",
                }}
              >
                {log.status}
              </span>
            </div>
          );
        })}
      </div>
      <Button
        variant="outline"
        size="sm"
        className="mt-3 w-full text-xs font-bold"
        style={{
          borderRadius: "var(--radius-input)",
          borderColor: "var(--color-brand-primary)",
          color: "var(--color-brand-primary)",
        }}
        onClick={() => router.push("/activity")}
      >
        Full Fleet Report
      </Button>
    </div>
  );
}
