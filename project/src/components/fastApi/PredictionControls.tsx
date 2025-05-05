import React from 'react';
import { Brain, Rows as Cows } from 'lucide-react';
import ModelSelector from './ModelSelector';
import { Model } from '../../lib/types';

interface PredictionControlsProps {
  models: Model[];
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  onPredictCow: () => void;
  onPredictHerd: () => void;
  isCowSelected: boolean;
  className?: string;
}

const PredictionControls: React.FC<PredictionControlsProps> = ({
  models,
  selectedModel,
  onModelChange,
  onPredictCow,
  onPredictHerd,
  isCowSelected,
  className = ''
}) => {
  return (
    <div className={`border-t pt-6 ${className}`}>
      <h4 className="text-lg font-semibold mb-4">Predicción de Producción</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <ModelSelector
          models={models}
          selectedModel={selectedModel}
          onModelChange={onModelChange}
        />
        
        <div className="flex flex-col md:flex-row items-end space-y-3 md:space-y-0 md:space-x-3">
          {isCowSelected && (
            <button
              onClick={onPredictCow}
              className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              <Brain className="h-5 w-5 mr-2" />
              <span className="whitespace-nowrap">Predicción por Vaca</span>
            </button>
          )}
          <button
            onClick={onPredictHerd}
            className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            <Cows className="h-5 w-5 mr-2" />
            <span className="whitespace-nowrap">Predicción del Rebaño</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PredictionControls;