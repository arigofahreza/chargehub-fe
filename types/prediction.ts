export interface PredictInput {
  truck_id: string;
  activity: string;
  duration_minutes: number;
  battery_before_pct: number;
  shift: string;
}

export interface PredictResult {
  truck_id: string;
  predicted_battery_after_pct: number;
}

export interface BatchPredictInput {
  items: PredictInput[];
}

export interface BatchPredictResult {
  predictions: PredictResult[];
}
