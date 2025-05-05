import React from 'react';
import { BulkPredictionResult } from '../../lib/types';

interface HerdPredictionResultsProps {
  results: BulkPredictionResult[];
  totalPrediction: number;
  className?: string;
}

const HerdPredictionResults: React.FC<HerdPredictionResultsProps> = ({
  results,
  totalPrediction,
  className = ''
}) => {
  if (results.length === 0) return null;
  
  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return 'text-green-600';
    if (accuracy >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  return (
    <div className={`bg-indigo-50 border border-indigo-200 rounded-md p-4 ${className}`}>
      <h5 className="text-lg font-semibold text-indigo-900 mb-4">Predicciones del Rebaño</h5>
      <div className="max-h-60 overflow-y-auto mb-4">
        {results.map(result => (
          <div key={result.cowId} className="flex justify-between items-center py-2 border-b border-indigo-100 last:border-b-0">
            <span className="font-medium text-indigo-800">{result.cowName}</span>
            <div className="flex items-center space-x-4">
              <span className="text-indigo-600 text-sm">Predicción: {result.prediction.toFixed(2)} L</span>
              <span className="text-indigo-600 text-sm">Real: {result.actual > 0 ? result.actual.toFixed(2) : 'N/A'} L</span>
              <span className={`text-sm font-semibold ${getAccuracyColor(result.accuracy)}`}>
                {result.accuracy.toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="border-t border-indigo-200 pt-3 mt-2">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-indigo-900">Total del Rebaño</span>
          <span className="text-lg font-bold text-indigo-900">{totalPrediction.toFixed(2)} L</span>
        </div>
      </div>
    </div>
  );
};

export default HerdPredictionResults;