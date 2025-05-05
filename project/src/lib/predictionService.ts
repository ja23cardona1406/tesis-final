import { getModelAndScaler } from './modelLoader';
import { formatInputForModel } from './dataPreprocessing';
import { supabase } from './supabase';

export interface PredictionInput {
  cowId: string;
  modelId: string;
  farmId: string;
  weight_kg: number;
  age_months: number;
  lactation_days: number;
  temperature: number;
  udder_humidity: number;
  feed_amount: number;
  weekly_feed_kg: number;
  breed: string;
  recentProductions: number[];
}

export interface PredictionResult {
  prediction: number;
  accuracy?: number;
  error?: string;
}

export interface SavePredictionParams {
  cow_id: string;
  predicted_production: number;
  actual_production: number;
  prediction_date: string;
  presicion: number;
}

/**
 * Predicts milk production using selected model and cow data
 */
export async function predictMilkProduction(input: PredictionInput): Promise<PredictionResult> {
  try {
    // Get the model and scaler
    const entry = getModelAndScaler(input.modelId);
    
    if (!entry) {
      throw new Error(`Model ${input.modelId} not found`);
    }
    
    const { model, scaler } = entry;
    
    // Format input for the model
    const formattedInput = formatInputForModel(input);
    
    // Scale the input
    const scaledInput = scaler.transform([formattedInput]);
    
    // Make prediction
    const predictionArray = model.predict(scaledInput);
    const prediction = predictionArray[0];
    
    // Add small random variation for realism
    const randomFactor = 0.95 + Math.random() * 0.1;
    const finalPrediction = prediction * randomFactor;
    
    // Ensure prediction is positive and reasonable
    return { 
      prediction: Math.max(0.5, finalPrediction) 
    };
  } catch (error) {
    console.error('Error predicting milk production:', error);
    return { 
      prediction: 0, 
      error: error instanceof Error ? error.message : 'Error al realizar la predicción'
    };
  }
}

/**
 * Saves prediction results to Supabase
 */
export async function savePrediction(params: SavePredictionParams): Promise<void> {
  try {
    const { error } = await supabase
      .from('predictions')
      .insert([params]);

    if (error) throw error;
  } catch (error) {
    console.error('Error saving prediction:', error);
    throw error;
  }
}

/**
 * Calculate prediction accuracy as a percentage
 */
export function calculateAccuracy(predicted: number, actual: number): number {
  if (actual === 0) return 0;
  const accuracy = 100 - Math.abs((predicted - actual) / actual * 100);
  return Math.max(0, Math.min(100, accuracy));
}