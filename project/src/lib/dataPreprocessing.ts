/**
 * StandardScaler class that mimics scikit-learn's StandardScaler
 * It standardizes features by removing the mean and scaling to unit variance
 */
export class StandardScaler {
    private means: number[] = [];
    private stds: number[] = [];
    private fitted: boolean = false;
  
    // Predefined means and stds for each feature to simulate pre-fitted scalers
    constructor() {
      // These values would typically be calculated from training data
      // We're using reasonable defaults for cattle production data
      this.means = [
        550, // peso_animal (kg)
        40,  // edad (months)
        150, // dias_lactancia
        22,  // temperatura (°C)
        65,  // humedad_ubre (%)
        15,  // alimentacion (kg)
        100, // weekly_feed_kg
        0.8, // raza_Holstein (boolean/fraction)
        18, 17.5, 17, 16.5, 16 // Recent productions (ordeño_x)
      ];
      
      this.stds = [
        80,  // peso_animal (kg)
        15,  // edad (months)
        60,  // dias_lactancia
        3,   // temperatura (°C)
        10,  // humedad_ubre (%)
        3,   // alimentacion (kg)
        20,  // weekly_feed_kg
        0.4, // raza_Holstein (boolean/fraction)
        4, 4, 4, 4, 4 // Recent productions (ordeño_x) 
      ];
      
      this.fitted = true;
    }
  
    /**
     * Transform features by standardizing them
     * @param X Array of feature arrays
     * @returns Transformed data
     */
    transform(X: number[][]): number[][] {
      if (!this.fitted) {
        console.warn('StandardScaler is not fitted. Using default parameters.');
      }
      
      return X.map(row => {
        return row.map((val, idx) => {
          // If the means/stds don't have an entry for this index, use defaults
          const mean = idx < this.means.length ? this.means[idx] : 0;
          const std = idx < this.stds.length ? this.stds[idx] : 1;
          
          // Standardize: (x - mean) / std
          return (val - mean) / std;
        });
      });
    }
  
    /**
     * Inverse transform standardized data back to original scale
     * @param X Array of standardized feature arrays
     * @returns Data in original scale
     */
    inverseTransform(X: number[][]): number[][] {
      if (!this.fitted) {
        console.warn('StandardScaler is not fitted. Using default parameters.');
      }
      
      return X.map(row => {
        return row.map((val, idx) => {
          // If the means/stds don't have an entry for this index, use defaults
          const mean = idx < this.means.length ? this.means[idx] : 0;
          const std = idx < this.stds.length ? this.stds[idx] : 1;
          
          // Inverse standardize: x * std + mean
          return val * std + mean;
        });
      });
    }
  }
  
  /**
   * Format input data for model prediction
   * @param input User input data
   * @returns Formatted array for model input
   */
  export function formatInputForModel(input: {
    weight_kg: number,
    age_months: number,
    lactation_days: number,
    temperature: number,
    udder_humidity: number,
    feed_amount: number,
    weekly_feed_kg: number,
    breed: string,
    recentProductions: number[]
  }): number[] {
    
    // One-hot encoding for breed
    const isHolstein = input.breed === 'Holstein' ? 1 : 0;
    
    // Create feature array in the order expected by the model
    const features = [
      input.weight_kg,
      input.age_months,
      input.lactation_days,
      input.temperature,
      input.udder_humidity,
      input.feed_amount,
      input.weekly_feed_kg,
      isHolstein,
      // Add recent productions
      ...input.recentProductions
    ];
    
    return features;
  }