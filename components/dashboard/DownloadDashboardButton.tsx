"use client";
import { useState } from "react";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { defaultDateRange, buildRows, sheetFromRows, downloadWorkbook } from "@/lib/excel";
import { getDashboardStats, getTopEnergy, getAvgKwhPerVehicle, getBatteryHourly } from "@/lib/services/dashboard";
import { getActivityLogs } from "@/lib/services/activity";
import { DashboardFilter } from "@/lib/types";

interface Props {
  filter: DashboardFilter;
}

export function DownloadDashboardButton({ filter }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const dates =
        filter.dateFrom && filter.dateTo
          ? { dateFrom: filter.dateFrom, dateTo: filter.dateTo }
          : defaultDateRange();

      const fullFilter: DashboardFilter = { vehicleId: filter.vehicleId, ...dates };

      const [stats, topEnergy, avgKwh, batteryHourly, logs] = await Promise.all([
        getDashboardStats(fullFilter),
        getTopEnergy(fullFilter),
        getAvgKwhPerVehicle(fullFilter),
        getBatteryHourly(fullFilter),
        getActivityLogs({
          serviceType: "all",
          vehicleId: filter.vehicleId ?? "all",
          dateFrom: dates.dateFrom,
          dateTo: dates.dateTo,
        }),
      ]);

      const wb = XLSX.utils.book_new();

      // Sheet 1: Ringkasan
      const totalDurationMin = logs.reduce((s, l) => s + (l.durationMinutes ?? 0), 0);
      const statsRows: (string | number)[][] = [
        ["Metrik", "Nilai"],
        ["Total Energi (kWh)", stats.totalKwh ?? 0],
        ["Total Aktivitas", stats.activityCount ?? 0],
        ["Total Waktu Penggunaan (menit)", Math.round(totalDurationMin)],
        ["Total Waktu Penggunaan (jam)", Math.round((totalDurationMin / 60) * 10) / 10],
        [
          "Periode",
          `${format(new Date(dates.dateFrom), "dd/MM/yyyy")} – ${format(new Date(dates.dateTo), "dd/MM/yyyy")}`,
        ],
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(statsRows), "Ringkasan");

      // Sheet 2: Rata-rata kWh
      XLSX.utils.book_append_sheet(
        wb,
        sheetFromRows(
          buildRows(avgKwh as unknown as Record<string, unknown>[], [
            { key: "vehicleName", label: "Kendaraan" },
            { key: "avgKwh", label: "Rata-rata kWh" },
            { key: "sessionCount", label: "Jumlah Sesi" },
          ])
        ),
        "Rata-rata kWh"
      );

      // Sheet 3: Estimasi Biaya
      XLSX.utils.book_append_sheet(
        wb,
        sheetFromRows(
          buildRows(avgKwh as unknown as Record<string, unknown>[], [
            { key: "vehicleName", label: "Kendaraan" },
            { key: "estimatedCost", label: "Estimasi Biaya (Rp)" },
            { key: "avgKwh", label: "Rata-rata kWh" },
            { key: "sessionCount", label: "Jumlah Sesi" },
          ])
        ),
        "Estimasi Biaya"
      );

      // Sheet 4: Energi Tertinggi
      XLSX.utils.book_append_sheet(
        wb,
        sheetFromRows(
          buildRows(topEnergy as unknown as Record<string, unknown>[], [
            { key: "vehicleName", label: "Kendaraan" },
            { key: "totalKwh", label: "Total kWh" },
            { key: "pct", label: "Persentase (%)" },
          ])
        ),
        "Energi Tertinggi"
      );

      // Sheet 5: Konsumsi per Jam
      const hourlyHeader: (string | number)[] = ["Jam", ...batteryHourly.vehicles];
      const hourlyRows: (string | number)[][] = batteryHourly.data.map((row) => [
        `${String(row.hour).padStart(2, "0")}:00`,
        ...batteryHourly.vehicles.map((v) => (row[v] as number) ?? 0),
      ]);
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.aoa_to_sheet([hourlyHeader, ...hourlyRows]),
        "Konsumsi per Jam"
      );

      // Sheet 6: Waktu Penggunaan (computed from logs)
      const usageMap: Record<string, number> = {};
      for (const l of logs) {
        if (!usageMap[l.vehicleName]) usageMap[l.vehicleName] = 0;
        usageMap[l.vehicleName] += l.durationMinutes ?? 0;
      }
      const usageData = Object.entries(usageMap).map(([vehicleName, totalMenit]) => ({
        vehicleName,
        totalMenit: Math.round(totalMenit),
        totalJam: Math.round((totalMenit / 60) * 10) / 10,
      }));
      XLSX.utils.book_append_sheet(
        wb,
        sheetFromRows(
          buildRows(usageData as unknown as Record<string, unknown>[], [
            { key: "vehicleName", label: "Kendaraan" },
            { key: "totalMenit", label: "Total Menit" },
            { key: "totalJam", label: "Total Jam" },
          ])
        ),
        "Waktu Penggunaan"
      );

      // Sheet 7: Semua Aktivitas
      XLSX.utils.book_append_sheet(
        wb,
        sheetFromRows(
          buildRows(logs as unknown as Record<string, unknown>[], [
            { key: "dateTime", label: "Tanggal & Waktu" },
            { key: "vehicleName", label: "Kendaraan" },
            { key: "unitId", label: "Unit ID" },
            { key: "serviceType", label: "Tipe Aktivitas" },
            { key: "driver", label: "Pengemudi" },
            { key: "status", label: "Status" },
            { key: "energyKwh", label: "Energi (kWh)" },
            { key: "durationMinutes", label: "Durasi (menit)" },
          ])
        ),
        "Semua Aktivitas"
      );

      const dateStr = format(new Date(), "yyyy-MM-dd");
      downloadWorkbook(wb, `laporan-dashboard-${dateStr}.xlsx`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      style={{
        background: "#DA0037",
        border: "none",
        borderRadius: 10,
        color: "#fff",
        fontSize: 11,
        fontWeight: 600,
        padding: "7px 12px",
        fontFamily: "inherit",
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.7 : 1,
        display: "flex",
        alignItems: "center",
        gap: 5,
        flexShrink: 0,
        height: 38,
      }}
    >
      {loading ? "Mengunduh..." : "↓ Unduh Laporan"}
    </button>
  );
}
