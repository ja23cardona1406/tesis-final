import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { 
  AlertTriangle,
  Save,
  RefreshCw,
  Plus,
  Milk,
  Brain,
  Calculator,
  Rows as Cows
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Cow {
  id: string;
  farm_id: string;
  name: string;
  weight_kg: number;
  age_months: number;
  lactation_days: number;
  breed: string;
  avg_production: number;
  status: 'active' | 'inactive' | 'treatment';
  milking_status: boolean;
  exclusion_reason: string;
  created_at: string;
}

interface DairyRecord {
  id: string;
  user_id: string;
  cow_id: string;
  production_liters: number;
  temperature: number;
  feed_amount: number;
  udder_humidity: number;
  weekly_feed_kg: number;
  session: 'Mañana' | 'Tarde';
  created_at: string;
}

interface Prediction {
  id: string;
  cow_id: string;
  predicted_production: number;
  actual_production: number;
  prediction_date: string;
  presicion: number;
  created_at: string;
}

function App() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [showNewCowForm, setShowNewCowForm] = useState(false);
  const [selectedCow, setSelectedCow] = useState<string | null>(null);
  const [cows, setCows] = useState<Cow[]>([]);
  const [dairyRecords, setDairyRecords] = useState<DairyRecord[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalProduction, setTotalProduction] = useState(0);
  const [showPredictionsTable, setShowPredictionsTable] = useState(true);
  const [showAllCows, setShowAllCows] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('model1');
  const [predictionResult, setPredictionResult] = useState<number | null>(null);
  const [productionData, setProductionData] = useState<{[key: string]: number}>({});
  const [bulkPredictionResults, setBulkPredictionResults] = useState<Array<{
    cowId: string;
    cowName: string;
    prediction: number;
    actual: number;
    accuracy: number;
  }>>([]);
  const [totalHerdPrediction, setTotalHerdPrediction] = useState<number>(0);

  const models = [
    { id: 'model1', name: 'Modelo regresion lineal' },
    { id: 'model2', name: 'Modelo regresion arbol de desición' },
    { id: 'model3', name: 'Modelo regresion rigde' },
    { id: 'model4', name: 'Modelo regresion redes neuronales' },
    { id: 'model5', name: 'Modelo regresion random forest' },
    { id: 'model6', name: 'Modelo regresion adaboost' }
  ];

  const [newCowData, setNewCowData] = useState({
    name: '',
    weight_kg: 0,
    age_months: 0,
    lactation_days: 0,
    breed: '',
    avg_production: 0,
    status: 'active' as const,
    milking_status: true,
    exclusion_reason: 'N/A'
  });

  const [dailyData, setDailyData] = useState({
    production_liters: 0,
    temperature: 0,
    feed_amount: 0,
    udder_humidity: 0,
    weekly_feed_kg: 0,
    session: 'Mañana' as 'Mañana' | 'Tarde'
  });

  useEffect(() => {
    const storedData = localStorage.getItem('cowProductionData');
    if (storedData) {
      setProductionData(JSON.parse(storedData));
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchCows();
      fetchTotalProduction();
      fetchPredictions();
    }
  }, [user]);

  useEffect(() => {
    if (selectedCow) {
      fetchDairyRecords(selectedCow);
    }
  }, [selectedCow]);

  const calculateAccuracy = (predicted: number, actual: number): number => {
    if (actual === 0) return 0;
    const accuracy = 100 - Math.abs((predicted - actual) / actual * 100);
    return Math.max(0, Math.min(100, accuracy));
  };

  const fetchPredictions = async () => {
    try {
      const { data, error } = await supabase
        .from('predictions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPredictions(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar las predicciones');
    }
  };

  const fetchTotalProduction = async () => {
    try {
      const { data, error } = await supabase
        .from('dairy_records')
        .select('production_liters');

      if (error) throw error;

      const total = data?.reduce((sum, record) => sum + record.production_liters, 0) || 0;
      setTotalProduction(total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al calcular la producción total');
    }
  };

  const fetchCows = async () => {
    try {
      setLoading(true);
      const { data: farmMembers, error: farmError } = await supabase
        .from('farm_members')
        .select('farm_id')
        .eq('user_id', user?.id)
        .eq('status', 'approved')
        .single();

      if (farmError) throw farmError;

      const { data: cowsData, error: cowsError } = await supabase
        .from('cows')
        .select('*')
        .eq('farm_id', farmMembers.farm_id)
        .order('name');

      if (cowsError) throw cowsError;

      setCows(cowsData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar las vacas');
    } finally {
      setLoading(false);
    }
  };

  const fetchDairyRecords = async (cowId: string) => {
    try {
      const { data, error } = await supabase
        .from('dairy_records')
        .select('*')
        .eq('cow_id', cowId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setDairyRecords(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los registros de ordeño');
    }
  };

  const handleDailyDataSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCow || !user?.id) return;

    try {
      const newRecord = {
        user_id: user.id,
        cow_id: selectedCow,
        production_liters: Number(dailyData.production_liters),
        temperature: Number(dailyData.temperature),
        feed_amount: Number(dailyData.feed_amount),
        udder_humidity: Number(dailyData.udder_humidity),
        weekly_feed_kg: Number(dailyData.weekly_feed_kg),
        session: dailyData.session
      };

      const { error } = await supabase
        .from('dairy_records')
        .insert([newRecord]);

      if (error) throw error;

      const updatedProductionData = {
        ...productionData,
        [selectedCow]: dailyData.production_liters
      };
      localStorage.setItem('cowProductionData', JSON.stringify(updatedProductionData));
      setProductionData(updatedProductionData);

      await fetchDairyRecords(selectedCow);
      await fetchTotalProduction();

      setDailyData({
        production_liters: 0,
        temperature: 0,
        feed_amount: 0,
        udder_humidity: 0,
        weekly_feed_kg: 0,
        session: 'Mañana'
      });

      alert('Registro guardado exitosamente');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar los datos');
      console.error('Error details:', err);
    }
  };

  const predictNextMilking = async () => {
    if (!selectedCow) return;
    
    try {
      const selectedCowData = cows.find(cow => cow.id === selectedCow);
      if (!selectedCowData) return;

      const { data: lastRecords } = await supabase
        .from('dairy_records')
        .select('*')
        .eq('cow_id', selectedCow)
        .order('created_at', { ascending: false })
        .limit(7);

      if (!lastRecords?.length) {
        throw new Error('No hay suficientes datos para la predicción');
      }

      const avgProduction = lastRecords.reduce((sum, record) => sum + record.production_liters, 0) / lastRecords.length;
      const prediction = avgProduction * 1.1;
      const actualProduction = productionData[selectedCow] || 0;
      const accuracy = calculateAccuracy(prediction, actualProduction);

      const { error: predictionError } = await supabase
        .from('predictions')
        .insert([{
          cow_id: selectedCow,
          predicted_production: prediction,
          actual_production: actualProduction,
          prediction_date: new Date().toISOString().split('T')[0],
          presicion: accuracy
        }]);

      if (predictionError) throw predictionError;

      setPredictionResult(prediction);
      await fetchPredictions();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al realizar la predicción');
    }
  };

  const predictAllCows = async () => {
    try {
      const predictions = [];
      let total = 0;

      for (const cow of cows) {
        if (cow.status === 'active') {
          const { data: lastRecords } = await supabase
            .from('dairy_records')
            .select('*')
            .eq('cow_id', cow.id)
            .order('created_at', { ascending: false })
            .limit(7);

          if (lastRecords?.length) {
            const avgProduction = lastRecords.reduce((sum, record) => sum + record.production_liters, 0) / lastRecords.length;
            const prediction = avgProduction * 1.1;
            const actualProduction = productionData[cow.id] || 0;
            const accuracy = calculateAccuracy(prediction, actualProduction);
            
            const { error: predictionError } = await supabase
              .from('predictions')
              .insert([{
                cow_id: cow.id,
                predicted_production: prediction,
                actual_production: actualProduction,
                prediction_date: new Date().toISOString().split('T')[0],
                presicion: accuracy
              }]);

            if (predictionError) throw predictionError;

            predictions.push({
              cowId: cow.id,
              cowName: cow.name,
              prediction: prediction,
              actual: actualProduction,
              accuracy: accuracy
            });
            
            total += prediction;
          }
        }
      }

      setBulkPredictionResults(predictions);
      setTotalHerdPrediction(total);
      await fetchPredictions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al realizar las predicciones');
    }
  };

  const handleStatusChange = async (cowId: string, newStatus: 'active' | 'inactive' | 'treatment') => {
    try {
      const { error } = await supabase
        .from('cows')
        .update({ status: newStatus })
        .eq('id', cowId);

      if (error) throw error;

      setCows(cows.map(cow => 
        cow.id === cowId ? { ...cow, status: newStatus } : cow
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el estado');
    }
  };

  const handleNewCowSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: farmMember, error: farmError } = await supabase
        .from('farm_members')
        .select('farm_id')
        .eq('user_id', user?.id)
        .eq('status', 'approved')
        .single();

      if (farmError) throw farmError;

      const { data: newCow, error: cowError } = await supabase
        .from('cows')
        .insert([
          {
            ...newCowData,
            farm_id: farmMember.farm_id
          }
        ])
        .select()
        .single();

      if (cowError) throw cowError;

      setCows([...cows, newCow]);
      setShowNewCowForm(false);
      setNewCowData({
        name: '',
        weight_kg: 0,
        age_months: 0,
        lactation_days: 0,
        breed: '',
        avg_production: 0,
        status: 'active',
        milking_status: true,
        exclusion_reason: 'N/A'
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la vaca');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center text-red-700">
          <AlertTriangle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {/* Production Summary */}
      <div className="mb-8 bg-indigo-50 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-indigo-900">Resumen de Producción</h3>
            <p className="text-indigo-700 mt-2">
              Producción total: <span className="font-bold">{totalProduction.toFixed(2)} L</span>
            </p>
          </div>
          <Calculator className="h-8 w-8 text-indigo-600" />
        </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Predicciones de Producción</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowAllCows(!showAllCows)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <Milk className="h-5 w-5 mr-2" />
            {showAllCows ? 'Ocultar Vacas' : 'Ver Todas las Vacas'}
          </button>
          <button
            onClick={() => setShowNewCowForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Agregar Vaca
          </button>
        </div>
      </div>

      {/* All Cows Table */}
      {showAllCows && (
        <div className="mb-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Todas las Vacas</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Raza</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producción Promedio</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cows.map(cow => (
                  <tr key={cow.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{cow.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{cow.breed}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        cow.status === 'active' ? 'bg-green-100 text-green-800' :
                        cow.status === 'treatment' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {cow.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{cow.avg_production} L</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedCow(cow.id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Seleccionar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Predictions Table */}
      <div className="mb-8 bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Historial de Predicciones</h3>
          <button
            onClick={() => setShowPredictionsTable(!showPredictionsTable)}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
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
                    <tr key={prediction.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(prediction.prediction_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{cow?.name || 'Desconocida'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{prediction.predicted_production.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {prediction.actual_production > 0 ? prediction.actual_production.toFixed(2) : 'Pendiente'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {prediction.presicion ? `${prediction.presicion.toFixed(1)}%` : 'N/A'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cow Selection */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Seleccionar Vaca
        </label>
        <select
          value={selectedCow || ''}
          onChange={(e) => setSelectedCow(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="">Seleccione una vaca</option>
          {cows.map(cow => (
            <option key={cow.id} value={cow.id}>
              {cow.name} - {cow.breed}
            </option>
          ))}
        </select>
      </div>

      {/* Selected Cow Details */}
      {selectedCow && cows.find(cow => cow.id === selectedCow) && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-semibold">
                {cows.find(cow => cow.id === selectedCow)?.name}
              </h3>
              <p className="text-gray-600">
                Raza: {cows.find(cow => cow.id === selectedCow)?.breed}
              </p>
            </div>
            <select
              value={cows.find(cow => cow.id === selectedCow)?.status}
              onChange={(e) => handleStatusChange(selectedCow, e.target.value as 'active' | 'inactive' | 'treatment')}
              className={`px-3 py-1 rounded-full text-sm ${
                cows.find(cow => cow.id === selectedCow)?.status === 'active' ? 'bg-green-100 text-green-800' :
                cows.find(cow => cow.id === selectedCow)?.status === 'treatment' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}
            >
              <option value="active">Activa</option>
              <option value="inactive">Inactiva</option>
              <option value="treatment">En tratamiento</option>
            </select>
          </div>

          {/* Daily Data Form */}
          <form onSubmit={handleDailyDataSubmit} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Producción (L)
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={dailyData.production_liters}
                onChange={(e) => setDailyData({...dailyData, production_liters: Number(e.target.value)})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temperatura (°C)
              </label>
              <input
                type="number"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={dailyData.temperature}
                onChange={(e) => setDailyData({...dailyData, temperature: Number(e.target.value)})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alimento (kg)
              </label>
              <input
                type="number"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={dailyData.feed_amount}
                onChange={(e) => setDailyData({...dailyData, feed_amount: Number(e.target.value)})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Humedad Ubre (%)
              </label>
              <input
                type="number"
                step="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={dailyData.udder_humidity}
                onChange={(e) => setDailyData({...dailyData, udder_humidity: Number(e.target.value)})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sesión
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={dailyData.session}
                onChange={(e) => setDailyData({...dailyData, session: e.target.value as 'Mañana' | 'Tarde'})}
                required
              >
                <option value="Mañana">Mañana</option>
                <option value="Tarde">Tarde</option>
              </select>
            </div>
            <div className="col-span-2 md:col-span-4 flex justify-end space-x-4">
              <button
                type="submit"
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Save className="h-5 w-5 mr-2" />
                Guardar Datos
              </button>
            </div>
          </form>

          {/* Model Selection and Prediction */}
          <div className="mt-8 border-t pt-6">
            <h4 className="text-lg font-semibold mb-4">Predicción de Producción</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccionar Modelo
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {models.map(model => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end space-x-4">
                {selectedCow && (
                  <button
                    onClick={predictNextMilking}
                    className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    <Brain className="h-5 w-5 mr-2" />
                    Prediccion proximo ordeño por vaca
                  </button>
                )}
                <button
                  onClick={predictAllCows}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  <Cows className="h-5 w-5 mr-2" />
                  Prediccion proximo ordeño del Rebaño
                </button>
              </div>
            </div>
            
            {predictionResult !== null && selectedCow && (
              <div className="bg-purple-50 border border-purple-200 rounded-md p-4 mb-4">
                <p className="text-purple-800">
                  Predicción para el próximo ordeño de {cows.find(cow => cow.id === selectedCow)?.name}:
                  <span className="font-bold ml-2">{predictionResult.toFixed(2)} L</span>
                </p>
              </div>
            )}

            {bulkPredictionResults.length > 0 && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-md p-4">
                <h5 className="text-lg font-semibold text-indigo-900 mb-4">Predicciones del Rebaño</h5>
                <div className="space-y-2">
                  {bulkPredictionResults.map(result => (
                    <div key={result.cowId} className="flex justify-between items-center">
                      <span className="text-indigo-800">{result.cowName}</span>
                      <div className="flex items-center space-x-4">
                        <span className="text-indigo-600">Predicción: {result.prediction.toFixed(2)} L</span>
                        <span className="text-indigo-600">Real: {result.actual.toFixed(2)} L</span>
                        <span className="font-semibold text-indigo-900">Precisión: {result.accuracy.toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                  <div className="border-t border-indigo-200 pt-2 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-indigo-900">Total del Rebaño</span>
                      <span className="text-lg font-bold text-indigo-900">{totalHerdPrediction.toFixed(2)} L</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recent Records */}
          {dairyRecords.length > 0 && (
            <div className="mt-8">
              <h4 className="text-lg font-semibold mb-4">Últimos Registros</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sesión</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producción (L)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temperatura</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Humedad Ubre %</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dairyRecords.map(record => (
                      <tr key={record.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(record.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.session}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.production_liters}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.temperature}°C</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.udder_humidity}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* New Cow Form Modal */}
      {showNewCowForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-2xl font-bold mb-4">Agregar Nueva Vaca</h3>
            <form onSubmit={handleNewCowSubmit} className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  value={newCowData.name}
                  onChange={(e) => setNewCowData({...newCowData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Peso (kg)
                </label>
                <input
                  type="number"
                  value={newCowData.weight_kg}
                  onChange={(e) => setNewCowData({...newCowData, weight_kg: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Edad (meses)
                </label>
                <input
                  type="number"
                  value={newCowData.age_months}
                  onChange={(e) => setNewCowData({...newCowData, age_months: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Días de lactancia
                </label>
                <input
                  type="number"
                  value={newCowData.lactation_days}
                  onChange={(e) => setNewCowData({...newCowData, lactation_days: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Raza
                </label>
                <select
                  value={newCowData.breed}
                  onChange={(e) => setNewCowData({...newCowData, breed: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Seleccione una raza</option>
                  <option value="Holstein">Holstein</option>
                  <option value="Jersey">Jersey</option>
                  <option value="Guernsey">Guernsey</option>
                  <option value="Brown Swiss">Brown Swiss</option>
                  <option value="Ayrshire">Ayrshire</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Producción promedio (L)
                </label>
                <input
                  type="number"
                  value={newCowData.avg_production}
                  onChange={(e) => setNewCowData({...newCowData, avg_production: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="col-span-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowNewCowForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;