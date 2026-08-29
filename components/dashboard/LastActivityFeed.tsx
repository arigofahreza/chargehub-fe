"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { ActivityLog } from "@/lib/types";

interface Props {
  logs: ActivityLog[];
  onRefresh?: () => Promise<void>;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function LastActivityFeed({ logs, onRefresh }: Props) {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const items = logs.slice(0, 5);

  async function handleRefresh() {
    if (!onRefresh || refreshing) return;
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #DEDEDE",
        borderRadius: 16,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
        flex: 1,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 600, fontSize: 15, color: "#171717" }}>Last Activity</span>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          title="Refresh"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            background: "none",
            border: "none",
            color: "#DA0037",
            fontSize: 12,
            fontFamily: "inherit",
            cursor: refreshing ? "default" : "pointer",
            opacity: refreshing ? 0.5 : 1,
            padding: 0,
          }}
        >
          <RefreshCw
            size={13}
            style={{
              transition: "transform 0.5s linear",
              transform: refreshing ? "rotate(360deg)" : "rotate(0deg)",
              animation: refreshing ? "spin 0.6s linear infinite" : "none",
            }}
          />
          <span>Refresh</span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </button>
      </div>

      {/* Items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1, overflowY: "auto" }}>
        {items.length === 0 ? (
          <span style={{ fontSize: 12, color: "#9CA3AF" }}>No recent activity</span>
        ) : (
          items.map((log, i) => (
            <div key={log.id}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#171717" }}>
                    {log.serviceType}
                  </span>
                  <span style={{ fontSize: 12, color: "#777777" }}>
                    {log.vehicleName} Â· {log.driver}
                  </span>
                </div>
                <span style={{ fontSize: 11, color: "#9CA3AF", flexShrink: 0 }}>
                  {timeAgo(log.dateTime)}
                </span>
              </div>
              {i < items.length - 1 && (
                <div style={{ height: 1, background: "#EDEDED", marginTop: 12 }} />
              )}
            </div>
          ))
        )}
      </div>

      {/* CTA */}
      <button
        onClick={() => router.push("/activity")}
        style={{
          height: 38,
          borderRadius: 8,
          background: "#F0F0F0",
          border: "1px solid #DEDEDE",
          color: "#171717",
          fontWeight: 700,
          fontSize: 12,
          fontFamily: "inherit",
          cursor: "pointer",
        }}
      >
        Full Fleet Report
      </button>
    </div>
  );
}
