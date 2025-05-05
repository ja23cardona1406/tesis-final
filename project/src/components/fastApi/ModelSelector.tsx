import React from 'react';
import { Brain } from 'lucide-react';
import { Model } from '../../lib/types';

interface ModelSelectorProps {
  models: Model[];
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  className?: string;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  selectedModel,
  onModelChange,
  className = ''
}) => {
  return (
    <div className={`bg-white p-4 rounded-lg shadow-sm ${className}`}>
      <div className="flex items-center mb-3">
        <Brain className="h-5 w-5 text-purple-600 mr-2" />
        <label className="text-sm font-medium text-gray-700">
          Seleccionar Modelo de Predicción
        </label>
      </div>
      
      <select
        value={selectedModel}
        onChange={(e) => onModelChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
      >
        {models.map(model => (
          <option key={model.id} value={model.id}>
            {model.name}
          </option>
        ))}
      </select>
      
      {models.find(m => m.id === selectedModel)?.description && (
        <p className="mt-2 text-sm text-gray-500">
          {models.find(m => m.id === selectedModel)?.description}
        </p>
      )}
    </div>
  );
};

export default ModelSelector;