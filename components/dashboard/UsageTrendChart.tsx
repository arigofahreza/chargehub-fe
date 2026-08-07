"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { day: "Mon", km: 1200 },
  { day: "Tue", km: 1900 },
  { day: "Wed", km: 1500 },
  { day: "Thu", km: 2100 },
  { day: "Fri", km: 1800 },
  { day: "Sat", km: 900 },
  { day: "Sun", km: 600 },
];

export function UsageTrendChart() {
  return (
    <div
      className="bg-white p-4"
      style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-card)" }}
    >
      <h3
        className="text-sm font-bold mb-4"
        style={{ color: "var(--color-ink)" }}
      >
        Usage Trend
      </h3>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#C3C6D7" />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: "#737686" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#737686" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #C3C6D7",
              fontSize: 12,
            }}
            formatter={(v) => [`${v} km`, "Distance"]}
          />
          <Line
            type="monotone"
            dataKey="km"
            stroke="#2563EB"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
