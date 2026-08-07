"use client";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const data = [
  { name: "Available", value: 60, color: "#00714D" },
  { name: "In Use", value: 30, color: "#2563EB" },
  { name: "Service", value: 10, color: "#BA1A1A" },
];

export function FleetStatusDonut() {
  return (
    <div
      className="bg-white p-4"
      style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-card)" }}
    >
      <h3
        className="text-sm font-bold mb-1"
        style={{ color: "var(--color-ink)" }}
      >
        Fleet Status
      </h3>
      <p className="text-xs mb-2" style={{ color: "var(--color-muted-text)" }}>
        124 total vehicles
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(v: number) => [`${v}%`, ""]} />
          <Legend
            iconSize={8}
            iconType="circle"
            wrapperStyle={{ fontSize: 11 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
