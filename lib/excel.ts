import * as XLSX from "xlsx";
import { subMonths } from "date-fns";

export type ColDef = { key: string; label: string };

export function defaultDateRange(): { dateFrom: string; dateTo: string } {
  const now = new Date();
  return {
    dateFrom: subMonths(now, 3).toISOString(),
    dateTo: now.toISOString(),
  };
}

export function buildRows(
  data: Record<string, unknown>[],
  columns: ColDef[]
): (string | number | null)[][] {
  const header = columns.map((c) => c.label);
  const rows = data.map((row) =>
    columns.map((c) => {
      const val = row[c.key];
      if (val === undefined || val === null) return "-";
      return val as string | number;
    })
  );
  return [header, ...rows];
}

export function sheetFromRows(rows: (string | number | null)[][]): XLSX.WorkSheet {
  return XLSX.utils.aoa_to_sheet(rows);
}

export function downloadWorkbook(wb: XLSX.WorkBook, filename: string): void {
  XLSX.writeFile(wb, filename);
}
