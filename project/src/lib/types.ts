export interface User {
  id: string;
  name?: string;
  email?: string;
}

export interface Cow {
  id: string;
  farm_id: string;
  name: string;
  weight_kg: number;
  age_months: number;
  lactation_days: number;
  breed: string;
  avg_production: number;
  status: 'active' | 'inactive' | 'treatment';
  milking_status: boolean;
  exclusion_reason: string;
  created_at: string;
}

export interface DairyRecord {
  id: string;
  user_id: string;
  cow_id: string;
  production_liters: number;
  temperature: number;
  feed_amount: number;
  udder_humidity: number;
  session: 'Mañana' | 'Tarde';
  created_at: string;
}

export interface Prediction {
  id: string;
  cow_id: string;
  predicted_production: number;
  actual_production: number | null;
  prediction_date: string;
  presicion: number | null;
  created_at: string;
}

export interface Model {
  id: string;
  name: string;
  description: string;
}

export interface BulkPredictionResult {
  cowId: string;
  cowName: string;
  prediction: number;
  actual: number;
  accuracy: number;
}

export interface PredictionParams {
  cowId: string;
  modelId: string;
  farmId: string;
  weight_kg: number;
  age_months: number;
  lactation_days: number;
  temperature: number;
  udder_humidity: number;
  feed_amount: number;
  breed: string;
  recentProductions: number[];
}

export interface PredictionResult {
  prediction: number;
  confidence: number;
}