"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { AvgKwhItem } from "@/lib/types";

interface Props {
  data: AvgKwhItem[];
}

function formatRupiah(amount: number): string {
  return "Rp " + amount.toLocaleString("id-ID");
}

function shortenName(name: string): string {
  return name.length > 12 ? name.slice(0, 11) + "…" : name;
}

function formatYAxis(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}jt`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}rb`;
  return String(v);
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as AvgKwhItem;
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #DEDEDE",
        borderRadius: 10,
        padding: "10px 14px",
        fontSize: 12,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        minWidth: 160,
      }}
    >
      <div style={{ fontWeight: 600, color: "#171717", marginBottom: 6 }}>{d.vehicleName}</div>
      <div style={{ color: "#444", marginBottom: 2 }}>
        <span style={{ color: "#00714D", fontWeight: 700 }}>{formatRupiah(d.estimatedCost)}</span>
      </div>
      <div style={{ color: "#999", fontSize: 11 }}>{d.avgKwh} kWh rata-rata · {d.sessionCount} sesi</div>
    </div>
  );
};

export function EstimasiCostChart({ data }: Props) {
  const chartData = data.map((d) => ({ ...d, label: shortenName(d.vehicleName) }));

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <span style={{ fontWeight: 600, fontSize: 15, color: "#171717", display: "block" }}>
            Estimasi Biaya per Kendaraan
          </span>
          <span style={{ fontSize: 11, color: "#777777" }}>
            Tarif: 1 kWh = Rp 1.114
          </span>
        </div>
        {data.length > 0 && (
          <div
            style={{
              background: "rgba(0,113,77,0.08)",
              borderRadius: 8,
              padding: "4px 10px",
              fontSize: 11,
              color: "#00714D",
              fontWeight: 600,
            }}
          >
            {data.length} kendaraan
          </div>
        )}
      </div>

      {chartData.length === 0 ? (
        <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 12, color: "#9CA3AF" }}>Tidak ada data untuk periode ini</span>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={chartData}
            margin={{ top: 24, right: 8, left: 8, bottom: 0 }}
            barCategoryGap="35%"
          >
            <defs>
              <linearGradient id="costBarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00714D" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#005A3E" stopOpacity={0.7} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#EDEDED" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "#777777" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#777777" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatYAxis}
              width={48}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,113,77,0.04)" }} />
            <Bar dataKey="estimatedCost" fill="url(#costBarGrad)" radius={[6, 6, 0, 0]} maxBarSize={48}>
              <LabelList
                dataKey="estimatedCost"
                position="top"
                formatter={(v: unknown) => formatYAxis(v as number)}
                style={{ fontSize: 10, fill: "#555", fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
