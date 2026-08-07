const vehicles = [
  { name: "EV-002 BYD Atto 3", percent: 94 },
  { name: "EV-006 MG4 Electric", percent: 87 },
  { name: "EV-004 Hyundai IONIQ 5", percent: 76 },
  { name: "EV-001 Tesla Model Y", percent: 65 },
  { name: "EV-005 Chery Omoda E5", percent: 54 },
];

export function TopEnergyList() {
  return (
    <div
      className="bg-white p-4"
      style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-card)" }}
    >
      <h3
        className="text-sm font-bold mb-4"
        style={{ color: "var(--color-ink)" }}
      >
        Top Energy Consumption
      </h3>
      <div className="space-y-3">
        {vehicles.map((v) => (
          <div key={v.name}>
            <div className="flex justify-between text-xs mb-1">
              <span
                className="font-medium truncate"
                style={{ color: "var(--color-body)" }}
              >
                {v.name}
              </span>
              <span
                className="ml-2 shrink-0"
                style={{ color: "var(--color-muted-text)" }}
              >
                {v.percent}%
              </span>
            </div>
            <div
              className="h-1.5 overflow-hidden"
              style={{
                backgroundColor: "var(--color-border-ch)",
                borderRadius: "9999px",
              }}
            >
              <div
                className="h-full"
                style={{
                  width: `${v.percent}%`,
                  backgroundColor: "var(--color-brand-accent)",
                  borderRadius: "9999px",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
