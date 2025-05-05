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
    weekly_feed_kg: number;
    session: 'Mañana' | 'Tarde';
    created_at: string;
  }
  
  export interface Prediction {
    id: string;
    cow_id: string;
    predicted_production: number;
    actual_production: number;
    prediction_date: string;
    presicion: number;
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