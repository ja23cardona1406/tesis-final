import React from 'react';

interface PredictionResultProps {
  cowName?: string;
  predictedProduction: number;
  actualProduction?: number;
  accuracy?: number;
  isHerd?: boolean;
  className?: string;
}

const PredictionResult: React.FC<PredictionResultProps> = ({
  cowName,
  predictedProduction,
  actualProduction,
  accuracy,
  isHerd = false,
  className = ''
}) => {
  const getAccuracyColor = (acc: number) => {
    if (acc >= 90) return 'text-green-600';
    if (acc >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={`bg-indigo-50 border border-indigo-200 rounded-md p-4 ${className}`}>
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-semibold text-indigo-900">
          {isHerd ? 'Predicción del Rebaño' : cowName ? `Predicción para ${cowName}` : 'Predicción'}
        </h4>
        <div className="bg-indigo-100 px-3 py-1 rounded-full text-indigo-800 font-medium text-sm">
          {predictedProduction.toFixed(2)} L
        </div>
      </div>
      
      {actualProduction !== undefined && (
        <div className="mt-3 flex justify-between items-center">
          <span className="text-sm text-indigo-700">Producción Real:</span>
          <span className="text-sm font-medium text-indigo-800">{actualProduction.toFixed(2)} L</span>
        </div>
      )}
      
      {accuracy !== undefined && (
        <div className="mt-1 flex justify-between items-center">
          <span className="text-sm text-indigo-700">Precisión:</span>
          <span className={`text-sm font-medium ${getAccuracyColor(accuracy)}`}>
            {accuracy.toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
};

export default PredictionResult;