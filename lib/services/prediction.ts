import type { PredictInput, PredictResult } from "@/types/prediction";

export async function predictBattery(input: PredictInput): Promise<PredictResult> {
  const res = await fetch("/api/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    throw new Error(`Prediction failed: ${res.status}`);
  }

  return res.json();
}
