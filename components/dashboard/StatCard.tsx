import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  delta?: string;
  deltaType?: "up" | "down" | "neutral";
  sublabel?: string;
}

export function StatCard({ label, value, delta, deltaType, sublabel }: StatCardProps) {
  return (
    <div
      className="bg-white flex flex-col gap-1 p-4"
      style={{
        borderRadius: "var(--radius-card)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <p
        className="text-xs font-medium uppercase tracking-wide"
        style={{ color: "var(--color-muted-text)" }}
      >
        {label}
      </p>
      <p
        className="text-2xl font-extrabold tracking-tight"
        style={{ color: "var(--color-ink)", letterSpacing: "-0.4px" }}
      >
        {value}
      </p>
      {delta && (
        <div
          className={cn("flex items-center gap-1 text-xs font-semibold")}
          style={{
            color:
              deltaType === "up"
                ? "var(--color-success)"
                : deltaType === "down"
                ? "var(--color-error)"
                : "var(--color-muted-text)",
          }}
        >
          {deltaType === "up" && <TrendingUp className="h-3 w-3" />}
          {deltaType === "down" && <TrendingDown className="h-3 w-3" />}
          {delta}
        </div>
      )}
      {sublabel && (
        <p className="text-xs" style={{ color: "var(--color-muted-text)" }}>
          {sublabel}
        </p>
      )}
    </div>
  );
}
