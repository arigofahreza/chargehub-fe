import Image from "next/image";
import { Vehicle } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Zap, Thermometer, Battery, Navigation } from "lucide-react";

interface SelectedVehicleCardProps {
  vehicle: Vehicle;
}

export function SelectedVehicleCard({ vehicle }: SelectedVehicleCardProps) {
  const metrics = [
    { icon: Thermometer, label: "Temp", value: `${vehicle.temperature}°C` },
    { icon: Zap, label: "Voltage", value: `${vehicle.voltage}V` },
    {
      icon: Battery,
      label: "Status",
      value:
        vehicle.status === "available"
          ? "Ready"
          : vehicle.status === "in-use"
          ? "In Use"
          : "Service",
    },
    { icon: Navigation, label: "Range", value: `${vehicle.range}km` },
  ];

  return (
    <div
      className="bg-white overflow-hidden"
      style={{ borderRadius: "var(--radius-card)", boxShadow: "var(--shadow-card)" }}
    >
      <div className="relative h-40">
        <Image
          src={vehicle.photoUrl}
          alt={vehicle.name}
          fill
          className="object-cover"
        />
        <div
          className="absolute bottom-2 right-2 px-3 py-1 text-xs font-bold text-white"
          style={{ backgroundColor: "rgba(11,28,48,0.7)", borderRadius: "9999px" }}
        >
          {vehicle.batteryPercent}%
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-bold" style={{ color: "var(--color-ink)" }}>
              {vehicle.name}
            </h3>
            <p className="text-xs" style={{ color: "var(--color-muted-text)" }}>
              {vehicle.fleetId}
            </p>
          </div>
          <Button
            size="sm"
            className="text-white text-xs font-bold"
            style={{
              backgroundColor: "var(--color-brand-primary)",
              borderRadius: "var(--radius-btn)",
              boxShadow: "var(--shadow-btn)",
            }}
          >
            <Zap className="mr-1 h-3 w-3" /> Charge Now
          </Button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {metrics.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1 bg-[#F8F9FF] p-2 text-center"
              style={{ borderRadius: "var(--radius-input)" }}
            >
              <Icon
                className="h-4 w-4"
                style={{ color: "var(--color-brand-accent)" }}
              />
              <p className="text-[10px]" style={{ color: "var(--color-muted-text)" }}>
                {label}
              </p>
              <p
                className="text-xs font-bold"
                style={{ color: "var(--color-ink)" }}
              >
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
