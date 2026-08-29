import { NextRequest, NextResponse } from "next/server";

const ML_API_URL = process.env.ML_API_URL ?? "http://localhost:8001";

const ML_ACTIVITIES = [
  { slug: "heavy_stacking", label: "Heavy Stacking" },
  { slug: "light_stacking", label: "Light Stacking" },
  { slug: "inspection", label: "Inspection" },
  { slug: "loading", label: "Loading" },
];

export async function POST(request: NextRequest) {
  const { truck_id, battery_before_pct, duration_minutes, shift } = await request.json();

  const results = await Promise.allSettled(
    ML_ACTIVITIES.map(({ slug, label }) =>
      fetch(`${ML_API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ truck_id, activity: slug, duration_minutes, battery_before_pct, shift }),
      })
        .then((r) => r.json())
        .then((data) => ({
          slug,
          label,
          predicted_after: data.predicted_battery_after_pct as number,
        }))
    )
  );

  const mlRecs = results
    .filter(
      (r): r is PromiseFulfilledResult<{ slug: string; label: string; predicted_after: number }> =>
        r.status === "fulfilled"
    )
    .map((r) => r.value);

  // Charging always included — restores battery (no ML model needed)
  const chargingEntry = {
    slug: "charging",
    label: "Charging",
    predicted_after: Math.min(100, (battery_before_pct ?? 0) + 60),
  };

  const recommendations = [...mlRecs, chargingEntry].sort(
    (a, b) => b.predicted_after - a.predicted_after
  );

  return NextResponse.json({ recommendations });
}
