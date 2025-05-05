import React from 'react';
import { Cow, Prediction } from '../../lib/types';

interface PredictionsTableProps {
  predictions: Prediction[];
  cows: Cow[];
  showPredictionsTable: boolean;
  toggleShowPredictions: () => void;
}

const PredictionsTable: React.FC<PredictionsTableProps> = ({
  predictions,
  cows,
  showPredictionsTable,
  toggleShowPredictions
}) => {
  return (
    <div className="mb-8 bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Historial de Predicciones</h3>
        <button
          onClick={toggleShowPredictions}
          className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          {showPredictionsTable ? 'Ocultar Historial' : 'Mostrar Historial'}
        </button>
      </div>
      
      {showPredictionsTable && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vaca</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Predicción (L)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producción Real (L)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precisión (%)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {predictions.map(prediction => {
                const cow = cows.find(c => c.id === prediction.cow_id);
                
                return (
                  <tr key={prediction.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(prediction.prediction_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{cow?.name || 'Desconocida'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{prediction.predicted_production.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {prediction.actual_production > 0 ? prediction.actual_production.toFixed(2) : 'Pendiente'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {prediction.presicion ? (
                          <>
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  prediction.presicion >= 90 ? 'bg-green-500' : 
                                  prediction.presicion >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                                }`} 
                                style={{ width: `${prediction.presicion}%` }}
                              ></div>
                            </div>
                            <span className="text-sm">{prediction.presicion.toFixed(1)}%</span>
                          </>
                        ) : 'N/A'}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PredictionsTable;