import { NotificationTemplate } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface Props {
  template: NotificationTemplate;
  onEdit: () => void;
}

const ICON_BG = ["#FFDAD6", "#DCE9FF", "#FFDDB8", "#EFF4FF"];
let _iconIdx = 0;
const iconBgMap: Record<string, string> = {};
function getIconBg(id: string) {
  if (!iconBgMap[id]) {
    iconBgMap[id] = ICON_BG[_iconIdx % ICON_BG.length];
    _iconIdx++;
  }
  return iconBgMap[id];
}

export function TemplateCard({ template, onEdit }: Props) {
  const active = template.status === "active";
  const iconBg = getIconBg(template.id);

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid rgba(195,198,215,0.5)",
        borderRadius: 14,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {/* Top row: icon + name + badge + edit */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div
            style={{
              width: 32,
              height: 36,
              borderRadius: 8,
              background: iconBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M6 10C6 6.5 8.5 4 12 4C15.5 4 18 6.5 18 10V14L20 17H4L6 14V10Z" stroke="#434655" strokeWidth="2" strokeLinejoin="round" />
              <path d="M9 20C9.5 21 10.6 21.7 12 21.7C13.4 21.7 14.5 21 15 20" stroke="#434655" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#0B1C30" }}>{template.name}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              padding: "3px 10px",
              borderRadius: 9999,
              background: active ? "#6CF8BB" : "#E2E8F0",
              color: active ? "#00714D" : "#434655",
            }}
          >
            {active ? "Active" : "Draft"}
          </span>
          <button
            onClick={onEdit}
            style={{
              width: 26,
              height: 26,
              borderRadius: 9999,
              border: "1px solid #C3C6D7",
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              cursor: "pointer",
            }}
          >
            <svg width="11" height="11" viewBox="0 0 18 18" fill="none">
              <path d="M2 16L2.5 12.5L12 3L15 6L5.5 15.5L2 16Z" fill="#434655" />
            </svg>
          </button>
        </div>
      </div>

      {/* Category + stats */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {template.category && template.category !== "General" && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              padding: "2px 8px",
              borderRadius: 9999,
              background: "#EFF4FF",
              color: "#004AC6",
              border: "1px solid rgba(0,74,198,0.15)",
              flexShrink: 0,
            }}
          >
            {template.category}
          </span>
        )}
        <div style={{ display: "flex", gap: 12, fontSize: 11, color: "#737686", flexWrap: "wrap" }}>
          <span>{template.employeeCount} employees</span>
          <span>{template.phoneCount} numbers</span>
          <span>Sent {formatDate(template.lastSent)}</span>
        </div>
      </div>

    </div>
  );
}
