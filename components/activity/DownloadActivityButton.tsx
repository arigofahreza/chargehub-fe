"use client";
import { useState } from "react";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { defaultDateRange, buildRows, sheetFromRows, downloadWorkbook } from "@/lib/excel";
import { getActivityLogs } from "@/lib/services/activity";
import { ActivityFilter } from "@/lib/types";

interface Props {
  filter: ActivityFilter;
}

export function DownloadActivityButton({ filter }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const dates =
        filter.dateFrom && filter.dateTo
          ? { dateFrom: filter.dateFrom, dateTo: filter.dateTo }
          : defaultDateRange();

      const logs = await getActivityLogs({ ...filter, ...dates });

      const rows = buildRows(logs as unknown as Record<string, unknown>[], [
        { key: "dateTime", label: "Tanggal & Waktu" },
        { key: "vehicleName", label: "Kendaraan" },
        { key: "unitId", label: "Unit ID" },
        { key: "serviceType", label: "Tipe Aktivitas" },
        { key: "driver", label: "Pengemudi" },
        { key: "status", label: "Status" },
        { key: "energyKwh", label: "Energi (kWh)" },
        { key: "durationMinutes", label: "Durasi (menit)" },
        { key: "createdBy", label: "Dibuat Oleh" },
      ]);

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, sheetFromRows(rows), "Log Aktivitas");

      const dateStr = format(new Date(), "yyyy-MM-dd");
      downloadWorkbook(wb, `log-aktivitas-${dateStr}.xlsx`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      style={{
        background: loading ? "#9CA3AF" : "#6B7280",
        border: "none",
        borderRadius: 10,
        color: "#fff",
        fontSize: 11,
        fontWeight: 600,
        padding: "9px 14px",
        fontFamily: "inherit",
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.7 : 1,
        display: "flex",
        alignItems: "center",
        gap: 5,
        flexShrink: 0,
      }}
    >
      {loading ? "Mengunduh..." : "↓ Unduh Log"}
    </button>
  );
}
