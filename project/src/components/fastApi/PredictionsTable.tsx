import React, { useState } from 'react';
import { Prediction, Cow } from '../../lib/types';
import { ArrowUpDown, AlertTriangle, Check, X } from 'lucide-react';

interface PredictionsTableProps {
  predictions: Prediction[];
  cows: Cow[];
  showPredictionsTable: boolean;
  toggleShowPredictions: () => void;
  loading?: boolean;
}

const PredictionsTable: React.FC<PredictionsTableProps> = ({
  predictions,
  cows,
  showPredictionsTable,
  toggleShowPredictions,
  loading = false
}) => {
  const [sortField, setSortField] = useState<keyof Prediction>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: keyof Prediction) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedPredictions = [...predictions].sort((a, b) => {
    let valueA: any = a[sortField];
    let valueB: any = b[sortField];
    
    // Convert dates to timestamps for comparison
    if (sortField === 'prediction_date' || sortField === 'created_at') {
      valueA = new Date(valueA).getTime();
      valueB = new Date(valueB).getTime();
    }
    
    if (valueA === null) return 1;
    if (valueB === null) return -1;
    
    const sortVal = valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
    return sortDirection === 'asc' ? sortVal : -sortVal;
  });

  const getCowName = (cowId: string) => {
    const cow = cows.find(c => c.id === cowId);
    return cow ? cow.name : 'Desconocida';
  };

  if (!showPredictionsTable) {
    return (
      <div className="mb-8">
        <button
          onClick={toggleShowPredictions}
          className="flex items-center px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
        >
          Mostrar historial de predicciones
        </button>
      </div>
    );
  }

  return (
    <div className="mb-8 bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Historial de Predicciones</h3>
        <button
          onClick={toggleShowPredictions}
          className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
        >
          Ocultar
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : predictions.length === 0 ? (
        <div className="flex items-center justify-center p-6 bg-gray-50 rounded-md text-gray-500">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <p>No hay predicciones registradas</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('prediction_date')}
                >
                  <div className="flex items-center">
                    Fecha
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vaca
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('predicted_production')}
                >
                  <div className="flex items-center">
                    Predicción (L)
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('actual_production')}
                >
                  <div className="flex items-center">
                    Real (L)
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('presicion')}
                >
                  <div className="flex items-center">
                    Precisión
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedPredictions.map(prediction => (
                <tr key={prediction.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(prediction.prediction_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getCowName(prediction.cow_id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {prediction.predicted_production.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {prediction.actual_production !== null 
                      ? prediction.actual_production.toFixed(2)
                      : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {prediction.presicion !== null ? (
                      <div className="flex items-center">
                        <div 
                          className={`h-2.5 w-2.5 rounded-full mr-2 ${
                            prediction.presicion >= 90 ? 'bg-green-500' :
                            prediction.presicion >= 75 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}>
                        </div>
                        {prediction.presicion.toFixed(1)}%
                      </div>
                    ) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PredictionsTable;