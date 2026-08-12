"use client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { UsageTrendPoint } from "@/lib/types";

interface Props {
  data: UsageTrendPoint[];
}

export function UsageTrendChart({ data }: Props) {
  const chartData = data.map((d) => ({
    time: d.date.slice(5), // show MM-DD
    km: d.km,
  }));

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #C3C6D7",
        borderRadius: 16,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
      }}
    >
      <div>
        <span style={{ fontWeight: 600, fontSize: 15, color: "#0B1C30", display: "block" }}>
          Usage Trend
        </span>
        <span style={{ fontSize: 11, color: "#737686" }}>Distance driven (Daily)</span>
      </div>
      {chartData.length === 0 ? (
        <div style={{ height: 120, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 12, color: "#9CA3AF" }}>No data for selected period</span>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={120}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="kmGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#EFF4FF" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: "#737686" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 10, fill: "#737686" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: "1px solid #C3C6D7", fontSize: 12 }}
              formatter={(v) => [`${v} km`, "Distance"]}
            />
            <Area
              type="monotone"
              dataKey="km"
              stroke="#2563EB"
              strokeWidth={2.5}
              fill="url(#kmGradient)"
              dot={false}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
