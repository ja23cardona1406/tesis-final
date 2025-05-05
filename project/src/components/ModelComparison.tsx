import React, { useState } from 'react';
import { 
  BarChart, 
  LineChart,
  Network,
  GitBranch, 
  Trees,
  ArrowUpNarrowWide
} from 'lucide-react';

interface ModelAccuracy {
  id: string;
  name: string;
  accuracy: number;
  icon: React.ReactNode;
  color: string;
}

const ModelComparison: React.FC = () => {
  const [showChart, setShowChart] = useState(true);

  const models: ModelAccuracy[] = [
    {
      id: 'model1',
      name: 'Regresión Lineal',
      accuracy: 99.62,
      icon: <LineChart className="h-5 w-5" />,
      color: 'blue'
    },
    {
      id: 'model2',
      name: 'Árbol de Decisión',
      accuracy: 99.83,
      icon: <GitBranch className="h-5 w-5" />,
      color: 'green'
    },
    {
      id: 'model3',
      name: 'Ridge Regression',
      accuracy: 99.99,
      icon: <BarChart className="h-5 w-5" />,
      color: 'purple'
    },
    {
      id: 'model4',
      name: 'Red Neuronal LSTM',
      accuracy: 97.60,
      icon: <Network className="h-5 w-5" />,
      color: 'red'
    },
    {
      id: 'model5',
      name: 'Random Forest',
      accuracy: 99.94,
      icon: <Trees className="h-5 w-5" />,
      color: 'teal'
    },
    {
      id: 'model6',
      name: 'AdaBoost',
      accuracy: 99.31,
      icon: <ArrowUpNarrowWide className="h-5 w-5" />,
      color: 'amber'
    }
  ];

  // Sort models by accuracy (highest first)
  const sortedModels = [...models].sort((a, b) => b.accuracy - a.accuracy);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Comparación de Modelos</h3>
        <button 
          onClick={() => setShowChart(!showChart)}
          className="text-sm text-indigo-600 hover:text-indigo-800"
        >
          {showChart ? 'Ver Tabla' : 'Ver Gráfico'}
        </button>
      </div>

      {showChart ? (
        <div className="h-72">
          {sortedModels.map(model => (
            <div key={model.id} className="mb-3">
              <div className="flex items-center mb-1">
                <div className={`text-${model.color}-600 mr-2`}>{model.icon}</div>
                <span className="text-sm">{model.name}</span>
                <span className="ml-auto text-sm font-medium">{model.accuracy}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`bg-${model.color}-600 h-2.5 rounded-full`} 
                  style={{ width: `${model.accuracy}%` }}
                ></div>
              </div>
            </div>
          ))}
          <div className="text-xs text-gray-500 mt-4 text-center">
            *Precisión basada en promedio de predicciones históricas
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modelo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precisión</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mejor para</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedModels.map(model => (
                <tr key={model.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`text-${model.color}-600 mr-2`}>{model.icon}</div>
                      <span>{model.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-${model.accuracy >= 90 ? 'green' : model.accuracy >= 80 ? 'yellow' : 'red'}-600 font-medium`}>
                      {model.accuracy}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {model.id === 'model1' && 'Datos simples, interpretabilidad'}
                    {model.id === 'model2' && 'Reglas de decisión claras'}
                    {model.id === 'model3' && 'Cuando hay muchas variables'}
                    {model.id === 'model4' && 'Patrones temporales complejos'}
                    {model.id === 'model5' && 'Mejor equilibrio precisión/velocidad'}
                    {model.id === 'model6' && 'Datos difíciles de predecir'}
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

export default ModelComparison;