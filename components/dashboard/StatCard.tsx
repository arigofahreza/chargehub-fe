interface StatCardProps {
  label: string;
  value: string;
  badge?: string;
  badgeBg?: string;
  badgeColor?: string;
  icon: React.ReactNode;
}

export function StatCard({ label, value, badge, badgeBg, badgeColor, icon }: StatCardProps) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #DEDEDE",
        borderRadius: 14,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {icon}
        {badge && (
          <span
            style={{
              fontSize: 8,
              fontWeight: 700,
              color: badgeColor ?? "#00714D",
              background: badgeBg ?? "rgba(0,113,77,0.1)",
              borderRadius: 4,
              padding: "2px 7px",
            }}
          >
            {badge}
          </span>
        )}
      </div>
      <span style={{ fontSize: 22, fontWeight: 700, color: "#171717" }}>{value}</span>
      <span
        style={{
          fontSize: 9,
          color: "#777777",
          letterSpacing: "0.3px",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
    </div>
  );
}
