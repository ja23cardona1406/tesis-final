import { StandardScaler } from './dataPreprocessing';

// Interface for model prediction input
export interface ModelInput {
  peso_animal: number;
  edad: number;
  dias_lactancia: number;
  temperatura: number;
  humedad_ubre: number;
  alimentacion: number;
  raza_Holstein: number;
  [key: string]: number; // For dynamic properties like ordeño_1, ordeño_2, etc.
}

// Base model interface
export interface Model {
  predict: (input: number[][]) => number[];
  name: string;
}

// Scaler interface
export interface Scaler {
  transform: (data: number[][]) => number[][];
  inverseTransform?: (data: number[][]) => number[][];
}

// Linear Regression Model
class LinearRegressionModel implements Model {
  name = 'Regresión Lineal';
  private weights: number[];
  private bias: number;

  constructor() {
    // Simulated weights for the linear model
    this.weights = [
      0.2, // peso_animal
      0.1, // edad
      0.05, // dias_lactancia
      -0.1, // temperatura (negative because higher temps can reduce production)
      0.15, // humedad_ubre
      0.3, // alimentacion
      0.1, // raza_Holstein
      0.4, 0.35, 0.3, 0.25, 0.2 // Recent production weights (ordeño_x)
    ];
    this.bias = 2.0; // Base production
  }

  predict(X: number[][]): number[] {
    return X.map(features => {
      let prediction = this.bias;
      for (let i = 0; i < features.length && i < this.weights.length; i++) {
        prediction += features[i] * this.weights[i];
      }
      return Math.max(0, prediction); // Production can't be negative
    });
  }
}

// Decision Tree Model
class DecisionTreeModel implements Model {
  name = 'Árbol de Decisión';

  predict(X: number[][]): number[] {
    return X.map(features => {
      // Simplified decision tree logic
      const weight = features[0];
      const age = features[1];
      const feed = features[5];
      const recentProduction = Math.max(...features.slice(8));
      
      let prediction;
      
      // Basic decision tree rules
      if (recentProduction > 20) {
        prediction = recentProduction * 0.95 + weight * 0.01;
      } else if (weight > 600) {
        prediction = 15 + weight * 0.02 + feed * 0.3;
      } else if (age > 48) {
        prediction = 12 + weight * 0.01 + feed * 0.2;
      } else {
        prediction = 8 + weight * 0.015 + feed * 0.25;
      }
      
      // Add some randomness for realistic variation
      prediction *= (0.9 + Math.random() * 0.2);
      
      return Math.max(0, prediction);
    });
  }
}

// Ridge Regression Model
class RidgeRegressionModel implements Model {
  name = 'Ridge Regression';
  private weights: number[];
  private bias: number;

  constructor() {
    // Similar to linear regression but with regularization effects
    this.weights = [
      0.18, // peso_animal
      0.09, // edad
      0.04, // dias_lactancia
      -0.08, // temperatura
      0.14, // humedad_ubre
      0.25, // alimentacion
      0.09, // raza_Holstein
      0.36, 0.32, 0.28, 0.24, 0.2 // Recent production weights (ordeño_x)
    ];
    this.bias = 1.8;
  }

  predict(X: number[][]): number[] {
    return X.map(features => {
      let prediction = this.bias;
      for (let i = 0; i < features.length && i < this.weights.length; i++) {
        prediction += features[i] * this.weights[i];
      }
      return Math.max(0, prediction);
    });
  }
}

// Neural Network (LSTM) Model
class NeuralNetworkModel implements Model {
  name = 'Red Neuronal LSTM';

  predict(X: number[][]): number[] {
    return X.map(features => {
      // More complex calculation simulating a neural network
      const weight = features[0];
      const age = features[1];
      const lactationDays = features[2];
      const temp = features[3];
      const humidity = features[4];
      const feed = features[5];
      const weeklyFeed = features[6];
      const isHolstein = features[7];
      const recentProductions = features.slice(8);
      
      // Calculate weighted average of recent productions
      const recentAvg = recentProductions.reduce((sum, val, idx) => 
        sum + val * (1 - idx * 0.1), 0) / recentProductions.reduce((sum, _, idx) => 
        sum + (1 - idx * 0.1), 0);
      
      // Neural network simulation with multiple interconnected factors
      let prediction = 1.0 +
        0.2 * weight +
        0.05 * age +
        (-0.001 * lactationDays) +
        (-0.2 * temp) +
        0.1 * humidity +
        0.3 * feed +
        0.2 * weeklyFeed +
        0.5 * isHolstein * weight / 500 +
        0.6 * recentAvg;
      
      // Add non-linear effects to simulate activation functions
      prediction *= (1 / (1 + Math.exp(-0.1 * (prediction - 10)))) * 1.5 + 0.5;
      
      // Add some randomness
      prediction *= (0.95 + Math.random() * 0.1);
      
      return Math.max(0, prediction);
    });
  }
}

// Random Forest Model
class RandomForestModel implements Model {
  name = 'Random Forest';
  private trees: DecisionTreeModel[];

  constructor() {
    // Create multiple decision trees with slight variations
    this.trees = Array(5).fill(0).map(() => new DecisionTreeModel());
  }

  predict(X: number[][]): number[] {
    return X.map(features => {
      // Run prediction through each tree and average the results
      const treePredictions = this.trees.map(() => {
        // Add some randomness to features to simulate different trees
        const modifiedFeatures = features.map(f => f * (0.9 + Math.random() * 0.2));
        return new DecisionTreeModel().predict([modifiedFeatures])[0];
      });
      
      // Average the predictions from all trees
      const forestPrediction = treePredictions.reduce((sum, val) => sum + val, 0) / this.trees.length;
      
      return forestPrediction;
    });
  }
}

// AdaBoost Model
class AdaBoostModel implements Model {
  name = 'AdaBoost';
  private baseModels: Model[];
  private weights: number[];

  constructor() {
    // Create multiple weak learners with weights
    this.baseModels = [
      new LinearRegressionModel(),
      new DecisionTreeModel(),
      new RidgeRegressionModel()
    ];
    this.weights = [0.3, 0.5, 0.2]; // Weights for each model
  }

  predict(X: number[][]): number[] {
    return X.map(features => {
      // Get prediction from each model
      const predictions = this.baseModels.map(model => 
        model.predict([features])[0]
      );
      
      // Calculate weighted average
      let adaBoostPrediction = 0;
      for (let i = 0; i < predictions.length; i++) {
        adaBoostPrediction += predictions[i] * this.weights[i];
      }
      
      // Add some randomness
      adaBoostPrediction *= (0.95 + Math.random() * 0.1);
      
      return adaBoostPrediction;
    });
  }
}

// Create standard scalers for each model
const createScaler = (modelType: string): Scaler => {
  return new StandardScaler();
};

// Dictionary with all models and their scalers
const modelsAndScalers: { [key: string]: { model: Model, scaler: Scaler } } = {
  'model1': { // Linear Regression
    model: new LinearRegressionModel(),
    scaler: createScaler('linear')
  },
  'model2': { // Decision Tree
    model: new DecisionTreeModel(),
    scaler: createScaler('tree')
  },
  'model3': { // Ridge Regression
    model: new RidgeRegressionModel(),
    scaler: createScaler('ridge')
  },
  'model4': { // Neural Network
    model: new NeuralNetworkModel(),
    scaler: createScaler('neural')
  },
  'model5': { // Random Forest
    model: new RandomForestModel(),
    scaler: createScaler('forest')
  },
  'model6': { // AdaBoost
    model: new AdaBoostModel(),
    scaler: createScaler('adaboost')
  }
};

// Get model and scaler by ID
export function getModelAndScaler(modelId: string) {
  return modelsAndScalers[modelId];
}