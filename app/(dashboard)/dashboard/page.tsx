import { TopBar } from "@/components/layout/TopBar";
import { StatCard } from "@/components/dashboard/StatCard";
import { SelectedVehicleCard } from "@/components/dashboard/SelectedVehicleCard";
import { UsageTrendChart } from "@/components/dashboard/UsageTrendChart";
import { FleetStatusDonut } from "@/components/dashboard/FleetStatusDonut";
import { TopEnergyList } from "@/components/dashboard/TopEnergyList";
import { LastActivityFeed } from "@/components/dashboard/LastActivityFeed";
import { getVehicles } from "@/lib/services/vehicles";
import { getActivityLogs } from "@/lib/services/activity";

export default async function DashboardPage() {
  const [vehicles, logs] = await Promise.all([getVehicles(), getActivityLogs()]);
  const featured = vehicles[0];

  return (
    <>
      <TopBar title="Fleet Analytics" />
      <main className="p-6 space-y-6">
        {/* Filter chip */}
        <div>
          <span
            className="inline-flex items-center text-xs font-bold px-3 py-1.5"
            style={{
              backgroundColor: "rgba(0,74,198,0.08)",
              color: "var(--color-brand-primary)",
              borderRadius: "9999px",
            }}
          >
            All Vehicles (124)
          </span>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            label="Total KM Driven"
            value="42,840"
            delta="+12% this month"
            deltaType="up"
          />
          <StatCard
            label="Carbon Impact"
            value="-240kg"
            delta="CO₂ saved"
            deltaType="up"
            sublabel="Eco savings"
          />
          <StatCard
            label="Est. Fuel Savings"
            value="$2,412"
            delta="-$120.5 vs target"
            deltaType="down"
          />
          <StatCard
            label="Fleet Reliability"
            value="94%"
            sublabel="Target: 98%"
          />
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-1 space-y-4">
            {featured && <SelectedVehicleCard vehicle={featured} />}
          </div>
          <div className="col-span-2 space-y-4">
            <UsageTrendChart />
            <div className="grid grid-cols-2 gap-4">
              <TopEnergyList />
              <FleetStatusDonut />
            </div>
          </div>
        </div>

        {/* Last activity */}
        <div className="max-w-sm">
          <LastActivityFeed logs={logs} />
        </div>
      </main>
    </>
  );
}
