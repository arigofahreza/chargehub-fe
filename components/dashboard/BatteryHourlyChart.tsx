"use client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { BatteryHourlyData } from "@/lib/types";

interface Props {
  data: BatteryHourlyData | null;
}

const COLORS = ["#DA0037", "#00714D", "#0080FF", "#FF6B35", "#7C3AED", "#B5002D"];

export function BatteryHourlyChart({ data }: Props) {
  if (!data || data.vehicles.length === 0) {
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
        }}
      >
        <div>
          <span style={{ fontWeight: 600, fontSize: 15, color: "#171717", display: "block" }}>
            Rata-rata Konsumsi Baterai / Jam
          </span>
          <span style={{ fontSize: 11, color: "#777777" }}>Avg kWh per hour of day</span>
        </div>
        <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 12, color: "#9CA3AF" }}>No data for selected period</span>
        </div>
      </div>
    );
  }

  const chartData = data.data.map((d) => ({
    ...d,
    hourLabel: `${String(d.hour).padStart(2, "0")}:00`,
  }));

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
        height: "100%",
      }}
    >
      <div>
        <span style={{ fontWeight: 600, fontSize: 15, color: "#171717", display: "block" }}>
          Rata-rata Konsumsi Baterai / Jam
        </span>
        <span style={{ fontSize: 11, color: "#777777" }}>Avg kWh per hour of day (stacked per vehicle)</span>
      </div>
      <div style={{ flex: 1, minHeight: 160 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            {data.vehicles.map((v, i) => (
              <linearGradient key={v} id={`bhGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.35} />
                <stop offset="95%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#EDEDED" vertical={false} />
          <XAxis
            dataKey="hourLabel"
            tick={{ fontSize: 9, fill: "#777777" }}
            axisLine={false}
            tickLine={false}
            interval={2}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#777777" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}`}
          />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: "1px solid #DEDEDE", fontSize: 11 }}
            formatter={(v, name) => [`${Number(v).toFixed(2)} kWh`, name as string]}
            labelFormatter={(l) => `${l}`}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
          />
          {data.vehicles.map((v, i) => (
            <Area
              key={v}
              type="monotone"
              dataKey={v}
              stackId="1"
              stroke={COLORS[i % COLORS.length]}
              fill={`url(#bhGrad${i})`}
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 3 }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}
