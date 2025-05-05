import React from 'react';
import { 
  LineChart, 
  Activity, 
  Network, 
  GitBranch, 
  Trees, 
  ArrowUpNarrowWide 
} from 'lucide-react';

interface ModelDetailsProps {
  modelId: string;
  className?: string;
}

const ModelDetails: React.FC<ModelDetailsProps> = ({ modelId, className = '' }) => {
  // Model information based on model ID
  const getModelInfo = () => {
    switch (modelId) {
      case 'model1':
        return {
          name: 'Regresión Lineal',
          icon: <LineChart className="h-12 w-12 text-blue-600" />,
          description: 'La regresión lineal es un modelo básico que encuentra la relación lineal entre las variables de entrada y la producción de leche. Es rápido y fácil de interpretar.',
          strengths: ['Simple y fácil de entender', 'Rápido para entrenar y predecir', 'Bueno para relaciones lineales'],
          weaknesses: ['No captura relaciones no lineales', 'Sensible a valores atípicos', 'Asume independencia entre variables'],
          accuracy: '70-80%',
          color: 'blue'
        };
      case 'model2':
        return {
          name: 'Árbol de Decisión',
          icon: <GitBranch className="h-12 w-12 text-green-600" />,
          description: 'El árbol de decisión divide los datos en ramas basadas en reglas de decisión, creando un modelo en forma de árbol para predecir la producción.',
          strengths: ['Captura relaciones no lineales', 'Fácil de visualizar e interpretar', 'No requiere normalización de datos'],
          weaknesses: ['Puede sobreajustarse a los datos', 'Inestable (pequeños cambios generan árboles muy diferentes)', 'Menos preciso en datos continuos'],
          accuracy: '75-85%',
          color: 'green'
        };
      case 'model3':
        return {
          name: 'Ridge Regression',
          icon: <Activity className="h-12 w-12 text-purple-600" />,
          description: 'Ridge Regression es una versión regularizada de la regresión lineal que reduce el riesgo de sobreajuste, especialmente útil cuando hay muchas variables.',
          strengths: ['Maneja bien la multicolinealidad', 'Menos propenso al sobreajuste', 'Bueno para datos con muchas variables'],
          weaknesses: ['Aún limitado a relaciones lineales', 'Requiere ajuste de hiperparámetros', 'Interpretabilidad reducida'],
          accuracy: '75-82%',
          color: 'purple'
        };
      case 'model4':
        return {
          name: 'Red Neuronal LSTM',
          icon: <Network className="h-12 w-12 text-red-600" />,
          description: 'LSTM (Long Short-Term Memory) es una red neuronal avanzada especializada en datos secuenciales, capaz de capturar patrones complejos y dependencias temporales.',
          strengths: ['Excelente para datos secuenciales', 'Captura patrones complejos no lineales', 'Retiene memoria de largo plazo'],
          weaknesses: ['Requiere mucho tiempo de entrenamiento', 'Necesita grandes cantidades de datos', 'Modelo de "caja negra" difícil de interpretar'],
          accuracy: '85-95%',
          color: 'red'
        };
      case 'model5':
        return {
          name: 'Random Forest',
          icon: <Trees className="h-12 w-12 text-teal-600" />,
          description: 'Random Forest combina múltiples árboles de decisión para crear un modelo más robusto y preciso que un solo árbol.',
          strengths: ['Alta precisión', 'Menos propenso al sobreajuste', 'Maneja bien datos no lineales y valores faltantes'],
          weaknesses: ['Más lento que un solo árbol', 'Menos interpretable', 'Puede ser computacionalmente intensivo'],
          accuracy: '82-92%',
          color: 'teal'
        };
      case 'model6':
        return {
          name: 'AdaBoost',
          icon: <ArrowUpNarrowWide className="h-12 w-12 text-amber-600" />,
          description: 'AdaBoost es un algoritmo de boosting que combina múltiples modelos débiles para crear un modelo fuerte, enfocándose en los ejemplos difíciles.',
          strengths: ['Alta precisión', 'Menos propenso al sobreajuste', 'Se adapta automáticamente a los datos difíciles'],
          weaknesses: ['Sensible a datos ruidosos', 'Puede ser lento de entrenar', 'Puede ser difícil de interpretar'],
          accuracy: '80-90%',
          color: 'amber'
        };
      default:
        return {
          name: 'Modelo Desconocido',
          icon: <LineChart className="h-12 w-12 text-gray-600" />,
          description: 'Información no disponible para este modelo.',
          strengths: ['Desconocido'],
          weaknesses: ['Desconocido'],
          accuracy: 'Desconocido',
          color: 'gray'
        };
    }
  };

  const modelInfo = getModelInfo();
  const colorClass = `border-${modelInfo.color}-500 bg-${modelInfo.color}-50 text-${modelInfo.color}-900`;

  return (
    <div className={`border rounded-lg shadow-sm p-6 ${className}`}>
      <div className="flex items-center mb-4">
        {modelInfo.icon}
        <h3 className="text-xl font-bold ml-4">{modelInfo.name}</h3>
      </div>
      
      <p className="text-gray-700 mb-4">{modelInfo.description}</p>
      
      <div className="mb-4">
        <h4 className="font-semibold mb-2 text-gray-800">Fortalezas:</h4>
        <ul className="list-disc pl-5 text-gray-700">
          {modelInfo.strengths.map((strength, index) => (
            <li key={index}>{strength}</li>
          ))}
        </ul>
      </div>
      
      <div className="mb-4">
        <h4 className="font-semibold mb-2 text-gray-800">Debilidades:</h4>
        <ul className="list-disc pl-5 text-gray-700">
          {modelInfo.weaknesses.map((weakness, index) => (
            <li key={index}>{weakness}</li>
          ))}
        </ul>
      </div>
      
      <div className="flex justify-between items-center mt-4">
        <span className="text-gray-700">Precisión típica:</span>
        <span className={`px-3 py-1 rounded-full font-semibold text-sm ${colorClass}`}>
          {modelInfo.accuracy}
        </span>
      </div>
    </div>
  );
};

export default ModelDetails;