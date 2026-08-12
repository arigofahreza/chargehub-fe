"use client";
import { useEffect, useMemo, useState } from "react";
import { startOfDay, endOfDay, subDays, subMonths, subWeeks } from "date-fns";
import { TopBar } from "@/components/layout/TopBar";
import { StatCard } from "@/components/dashboard/StatCard";
import { SelectedVehicleCard } from "@/components/dashboard/SelectedVehicleCard";
import { UsageTrendChart } from "@/components/dashboard/UsageTrendChart";
import { FleetStatusDonut } from "@/components/dashboard/FleetStatusDonut";
import { TopEnergyList } from "@/components/dashboard/TopEnergyList";
import { LastActivityFeed } from "@/components/dashboard/LastActivityFeed";
import { Calendar, RangeValue } from "@/components/ui/calendar-range";
import { getVehicles } from "@/lib/services/vehicles";
import { getActivityLogs } from "@/lib/services/activity";
import {
  getFleetStatus,
  getUsageTrend,
  getTopEnergy,
  getDashboardStats,
} from "@/lib/services/dashboard";
import {
  Vehicle,
  ActivityLog,
  FleetStatusData,
  UsageTrendPoint,
  TopEnergyItem,
  DashboardStats,
  DashboardFilter,
} from "@/lib/types";
import { Wave } from "@/components/ui/wave";
import { SelectDropdown } from "@/components/ui/select-dropdown";

const selectStyle: React.CSSProperties = {
  height: 38,
  borderRadius: 8,
  background: "#F8F9FF",
  border: "1px solid rgba(195,198,215,0.3)",
  padding: "0 10px",
  fontSize: 13,
  fontFamily: "inherit",
  color: "#0B1C30",
  outline: "none",
};

const KmIcon = () => (
  <svg width="15" height="16" viewBox="0 0 18 16" fill="none">
    <path d="M2 13L5 5H13L16 13" stroke="#004AC6" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="5.5" cy="13" r="1.5" fill="#004AC6" />
    <circle cx="12.5" cy="13" r="1.5" fill="#004AC6" />
  </svg>
);

const EcoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
    <path d="M9 1C4 1 2 5 2 9C2 13 5 17 9 17C13 17 16 13 16 9" stroke="#004AC6" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    <path d="M9 5V13M9 5L6 8M9 5L12 8" stroke="#004AC6" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DollarIcon = () => (
  <svg width="14" height="17" viewBox="0 0 14 18" fill="none">
    <path d="M7 1V17M10.5 4.5C10.5 3 9 2 7 2C5 2 3.5 3 3.5 4.5C3.5 6 5 6.5 7 7C9 7.5 10.5 8 10.5 9.5C10.5 11 9 12 7 12C5 12 3.5 11 3.5 9.5" stroke="#004AC6" strokeWidth="1.6" fill="none" strokeLinecap="round" />
  </svg>
);

const LightningIcon = () => (
  <svg width="14" height="18" viewBox="0 0 16 20" fill="#00714D">
    <path d="M 6.55 16.2 L 11.725 10 L 7.725 10 L 8.45 4.325 L 3.825 11 L 7.3 11 L 6.55 16.2 M 4 20 L 5 13 L 0 13 L 9 0 L 11 0 L 10 8 L 16 8 L 6 20 L 4 20" />
  </svg>
);

const FilterIcon = () => (
  <svg width="14" height="10" viewBox="0 0 18 12" fill="#004AC6">
    <path d="M 7 12 L 7 10 L 11 10 L 11 12 L 7 12 M 3 7 L 3 5 L 15 5 L 15 7 L 3 7 M 0 2 L 0 0 L 18 0 L 18 2 L 0 2" />
  </svg>
);

export default function DashboardPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [fleetStatus, setFleetStatus] = useState<FleetStatusData | null>(null);
  const [usageTrend, setUsageTrend] = useState<UsageTrendPoint[]>([]);
  const [topEnergy, setTopEnergy] = useState<TopEnergyItem[]>([]);
  const [dashStats, setDashStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const [vehicleId, setVehicleId] = useState("all");
  const [dateRange, setDateRange] = useState<RangeValue | null>(null);

  const filter: DashboardFilter = {
    vehicleId: vehicleId !== "all" ? vehicleId : undefined,
    dateFrom: dateRange?.start?.toISOString(),
    dateTo: dateRange?.end?.toISOString(),
  };

  const presets = useMemo(() => {
    const now = new Date();
    return {
      "today": { text: "Today", start: startOfDay(now), end: endOfDay(now) },
      "last-7-days": { text: "Last 7 Days", start: startOfDay(subDays(now, 7)), end: endOfDay(now) },
      "last-30-days": { text: "Last 30 Days", start: startOfDay(subDays(now, 30)), end: endOfDay(now) },
      "last-2-weeks": { text: "Last 2 Weeks", start: startOfDay(subWeeks(now, 2)), end: endOfDay(now) },
      "last-month": { text: "Last Month", start: startOfDay(subMonths(now, 1)), end: endOfDay(now) },
      "last-3-months": { text: "Last 3 Months", start: startOfDay(subMonths(now, 3)), end: endOfDay(now) },
    };
  }, []);

  useEffect(() => {
    getVehicles().then(setVehicles);
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getFleetStatus(filter),
      getUsageTrend(filter),
      getTopEnergy(filter),
      getDashboardStats(filter),
      getActivityLogs(),
    ]).then(([fs, ut, te, ds, al]) => {
      setFleetStatus(fs);
      setUsageTrend(ut);
      setTopEnergy(te);
      setDashStats(ds);
      setLogs(al);
      setLoading(false);
    });
  }, [vehicleId, dateRange]);

  const featured = vehicles.find((v) => v.id === vehicleId) ?? vehicles[0];
  const hasFilter = vehicleId !== "all" || dateRange !== null;

  return (
    <>
      <TopBar />
      <main
        className="p-4 md:p-8"
        style={{ display: "flex", flexDirection: "column", gap: 24, width: "100%" }}
      >
        {/* Title row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontWeight: 700, fontSize: 28, color: "#0B1C30", letterSpacing: "-0.4px", lineHeight: "1.2" }}>
              Fleet Analytics
            </span>
            <span style={{ fontSize: 14, color: "#434655" }}>Real-time monitoring across your fleet.</span>
          </div>

          {/* Filter bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {/* Vehicle selector */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "#fff",
                border: "1px solid #C3C6D7",
                borderRadius: 10,
                padding: "4px 8px 4px 14px",
              }}
            >
              <FilterIcon />
              <SelectDropdown
                value={vehicleId}
                onChange={setVehicleId}
                options={[
                  { value: "all", label: `All Vehicles (${vehicles.length})` },
                  ...vehicles.map((v) => ({ value: v.id, label: v.name })),
                ]}
                style={{ ...selectStyle, background: "transparent", border: "none", padding: 0, height: 30 }}
              />
            </div>

            {/* Date range picker */}
            <Calendar
              value={dateRange}
              onChange={setDateRange}
              presets={presets}
              showTimeInput={false}
              showTimezone={false}
            />

            {/* Clear filters */}
            {hasFilter && (
              <button
                onClick={() => { setVehicleId("all"); setDateRange(null); }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#004AC6",
                  fontWeight: 700,
                  fontSize: 13,
                  fontFamily: "inherit",
                  cursor: "pointer",
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Wave className="size-16 text-[#004AC6]" />
            <p className="text-sm" style={{ color: "var(--color-muted-text)" }}>Loading dashboard...</p>
          </div>
        ) : (
          <>
            {/* 4 stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <StatCard
                label="Total KM Driven"
                value={dashStats ? `${dashStats.totalKm.toLocaleString()} km` : "—"}
                badge={dashStats ? `${dashStats.activityCount} trips` : ""}
                badgeBg="rgba(0,113,77,0.1)"
                badgeColor="#00714D"
                icon={<KmIcon />}
              />
              <StatCard
                label="Energy Used"
                value={dashStats ? `${dashStats.totalKwh} kWh` : "—"}
                badge="Total consumed"
                badgeBg="rgba(0,113,77,0.1)"
                badgeColor="#00714D"
                icon={<EcoIcon />}
              />
              <StatCard
                label="Avg Battery"
                value={dashStats ? `${dashStats.avgBatteryPct}%` : "—"}
                badge="Fleet average"
                badgeBg="transparent"
                badgeColor="#00714D"
                icon={<DollarIcon />}
              />
              <StatCard
                label="Fleet Reliability"
                value={dashStats ? `${dashStats.availableCount}/${dashStats.totalVehicles}` : "—"}
                badge="Available"
                badgeBg="transparent"
                badgeColor="#00714D"
                icon={<LightningIcon />}
              />
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4 md:gap-5 items-start">
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {featured && <SelectedVehicleCard vehicle={featured} />}
                <UsageTrendChart data={usageTrend} />
                <TopEnergyList items={topEnergy} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {fleetStatus && <FleetStatusDonut data={fleetStatus} />}
                <LastActivityFeed logs={logs} />
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}
