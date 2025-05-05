import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import {
  AlertTriangle,
  Save,
  Plus,
  Milk,
  Calculator,
  Rows,
  Info
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { predictMilkProduction, savePrediction, calculateAccuracy } from '../lib/predictionService';
import { predictionModels } from '../../models/model';
import { Cow, DairyRecord, Prediction, BulkPredictionResult } from '../lib/types';
import PredictionsTable from './fastApi/PredictionsTable';
import PredictionControls from './fastApi/PredictionControls';
import PredictionResult from './fastApi/PredictionResult';
import HerdPredictionResults from './fastApi/HerdPredictionResults';
import ModelDetails from './ModelDetails';
import ModelComparison from './ModelComparison';

// Mock user for demonstration purposes
const mockUser = { id: 'mock-user-id', name: 'Demo User' };

function Predictions() {
  // In a real app, this would come from Redux
  // For demo purposes, we'll use the mock user
  const user = mockUser;
  
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
  const [bulkPredictionResults, setBulkPredictionResults] = useState<BulkPredictionResult[]>([]);
  const [totalHerdPrediction, setTotalHerdPrediction] = useState<number>(0);
  const [predictionAccuracy, setPredictionAccuracy] = useState<number | null>(null);
  const [showNewCowForm, setShowNewCowForm] = useState(false);
  const [showModelDetails, setShowModelDetails] = useState(false);

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

  // Load saved production data from localStorage
  useEffect(() => {
    const storedData = localStorage.getItem('cowProductionData');
    if (storedData) {
      setProductionData(JSON.parse(storedData));
    }
  }, []);

  // Load mock data for demonstration
  useEffect(() => {
    const loadMockData = () => {
      setLoading(true);
      
      // Mock cows data
      const mockCows: Cow[] = [
        { 
          id: 'cow-1', 
          farm_id: 'farm-1', 
          name: 'Bella', 
          weight_kg: 580, 
          age_months: 36, 
          lactation_days: 120, 
          breed: 'Holstein', 
          avg_production: 22.5, 
          status: 'active', 
          milking_status: true, 
          exclusion_reason: 'N/A',
          created_at: new Date().toISOString()
        },
        { 
          id: 'cow-2', 
          farm_id: 'farm-1', 
          name: 'Luna', 
          weight_kg: 540, 
          age_months: 48, 
          lactation_days: 90, 
          breed: 'Jersey', 
          avg_production: 18.2, 
          status: 'active', 
          milking_status: true, 
          exclusion_reason: 'N/A',
          created_at: new Date().toISOString()
        },
        { 
          id: 'cow-3', 
          farm_id: 'farm-1', 
          name: 'Estrella', 
          weight_kg: 620, 
          age_months: 42, 
          lactation_days: 150, 
          breed: 'Holstein', 
          avg_production: 25.1, 
          status: 'active', 
          milking_status: true, 
          exclusion_reason: 'N/A',
          created_at: new Date().toISOString()
        },
        { 
          id: 'cow-4', 
          farm_id: 'farm-1', 
          name: 'Manchas', 
          weight_kg: 510, 
          age_months: 30, 
          lactation_days: 60, 
          breed: 'Brown Swiss', 
          avg_production: 19.8, 
          status: 'treatment', 
          milking_status: false, 
          exclusion_reason: 'Mastitis',
          created_at: new Date().toISOString()
        },
        { 
          id: 'cow-5', 
          farm_id: 'farm-1', 
          name: 'Nube', 
          weight_kg: 590, 
          age_months: 54, 
          lactation_days: 180, 
          breed: 'Holstein', 
          avg_production: 21.3, 
          status: 'active', 
          milking_status: true, 
          exclusion_reason: 'N/A',
          created_at: new Date().toISOString()
        }
      ];
      
      // Generate mock dairy records
      const generateMockRecords = (cowId: string, count: number): DairyRecord[] => {
        const records: DairyRecord[] = [];
        const now = new Date();
        
        for (let i = 0; i < count; i++) {
          const date = new Date();
          date.setDate(now.getDate() - i);
          
          const cow = mockCows.find(c => c.id === cowId);
          const baseProd = cow ? cow.avg_production : 20;
          
          records.push({
            id: `record-${cowId}-${i}`,
            user_id: user.id,
            cow_id: cowId,
            production_liters: baseProd * (0.9 + Math.random() * 0.2),
            temperature: 20 + Math.random() * 5,
            feed_amount: 12 + Math.random() * 8,
            udder_humidity: 60 + Math.random() * 20,
            weekly_feed_kg: 80 + Math.random() * 40,
            session: i % 2 === 0 ? 'Mañana' : 'Tarde',
            created_at: date.toISOString()
          });
        }
        
        return records;
      };
      
      // Generate mock predictions
      const generateMockPredictions = (): Prediction[] => {
        const predictions: Prediction[] = [];
        const now = new Date();
        
        mockCows.forEach(cow => {
          for (let i = 0; i < 5; i++) {
            const date = new Date();
            date.setDate(now.getDate() - i);
            
            const predictedProduction = cow.avg_production * (0.9 + Math.random() * 0.2);
            const actualProduction = cow.avg_production * (0.9 + Math.random() * 0.2);
            const accuracy = calculateAccuracy(predictedProduction, actualProduction);
            
            predictions.push({
              id: `pred-${cow.id}-${i}`,
              cow_id: cow.id,
              predicted_production: predictedProduction,
              actual_production: actualProduction,
              prediction_date: date.toISOString().split('T')[0],
              presicion: accuracy,
              created_at: date.toISOString()
            });
          }
        });
        
        return predictions.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      };
      
      setCows(mockCows);
      setDairyRecords(generateMockRecords('cow-1', 10));
      setPredictions(generateMockPredictions());
      setTotalProduction(mockCows.reduce((sum, cow) => sum + cow.avg_production * 10, 0));
      setLoading(false);
    };
    
    loadMockData();
  }, [user.id]);

  // Load dairy records when a cow is selected
  useEffect(() => {
    if (selectedCow) {
      // In a real app, this would fetch from Supabase
      // For the demo, we'll generate mock records
      const generateMockRecords = (cowId: string, count: number): DairyRecord[] => {
        const records: DairyRecord[] = [];
        const now = new Date();
        
        const cow = cows.find(c => c.id === cowId);
        const baseProd = cow ? cow.avg_production : 20;
        
        for (let i = 0; i < count; i++) {
          const date = new Date();
          date.setDate(now.getDate() - i);
          
          records.push({
            id: `record-${cowId}-${i}`,
            user_id: user.id,
            cow_id: cowId,
            production_liters: baseProd * (0.9 + Math.random() * 0.2),
            temperature: 20 + Math.random() * 5,
            feed_amount: 12 + Math.random() * 8,
            udder_humidity: 60 + Math.random() * 20,
            weekly_feed_kg: 80 + Math.random() * 40,
            session: i % 2 === 0 ? 'Mañana' : 'Tarde',
            created_at: date.toISOString()
          });
        }
        
        return records;
      };
      
      setDairyRecords(generateMockRecords(selectedCow, 10));
    }
  }, [selectedCow, cows]);

  const handleDailyDataSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCow || !user?.id) return;

    try {
      const newRecord = {
        id: `record-${Date.now()}`,
        user_id: user.id,
        cow_id: selectedCow,
        production_liters: Number(dailyData.production_liters),
        temperature: Number(dailyData.temperature),
        feed_amount: Number(dailyData.feed_amount),
        udder_humidity: Number(dailyData.udder_humidity),
        weekly_feed_kg: Number(dailyData.weekly_feed_kg),
        session: dailyData.session,
        created_at: new Date().toISOString()
      };

      // Update local state
      setDairyRecords([newRecord, ...dairyRecords]);
      
      // Store in local storage
      const updatedProductionData = {
        ...productionData,
        [selectedCow]: dailyData.production_liters
      };
      localStorage.setItem('cowProductionData', JSON.stringify(updatedProductionData));
      setProductionData(updatedProductionData);

      // Update total production
      setTotalProduction(totalProduction + dailyData.production_liters);

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
    }
  };

  const predictNextMilking = async () => {
    if (!selectedCow) return;

    try {
      const selectedCowData = cows.find(cow => cow.id === selectedCow);
      if (!selectedCowData) return;

      // Get recent production data
      const recentProductions = dairyRecords
        .slice(0, 7)
        .map(record => record.production_liters);
      
      // Call prediction service
      const result = await predictMilkProduction({
        cowId: selectedCow,
        modelId: selectedModel,
        farmId: selectedCowData.farm_id,
        weight_kg: selectedCowData.weight_kg,
        age_months: selectedCowData.age_months,
        lactation_days: selectedCowData.lactation_days,
        temperature: dairyRecords[0]?.temperature || 22,
        udder_humidity: dairyRecords[0]?.udder_humidity || 70,
        feed_amount: dairyRecords[0]?.feed_amount || 15,
        weekly_feed_kg: dairyRecords[0]?.weekly_feed_kg || 100,
        breed: selectedCowData.breed,
        recentProductions
      });

      const prediction = result.prediction;
      const actualProduction = productionData[selectedCow] || 0;
      const accuracy = calculateAccuracy(prediction, actualProduction);

      // Save prediction
      const newPrediction = {
        id: `pred-${Date.now()}`,
        cow_id: selectedCow,
        predicted_production: prediction,
        actual_production: actualProduction,
        prediction_date: new Date().toISOString().split('T')[0],
        presicion: accuracy,
        created_at: new Date().toISOString()
      };
      
      setPredictions([newPrediction, ...predictions]);
      setPredictionResult(prediction);
      setPredictionAccuracy(accuracy);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al realizar la predicción');
    }
  };

  const predictAllCows = async () => {
    try {
      const results: BulkPredictionResult[] = [];
      let total = 0;

      for (const cow of cows) {
        if (cow.status === 'active') {
          // Get recent production data for this cow
          const cowRecords = dairyRecords.filter(r => r.cow_id === cow.id);
          const recentProductions = cowRecords
            .slice(0, 7)
            .map(record => record.production_liters);
            
          if (recentProductions.length === 0) {
            // If no records, use average production
            recentProductions.push(cow.avg_production);
          }
          
          // Call prediction service for this cow
          const result = await predictMilkProduction({
            cowId: cow.id,
            modelId: selectedModel,
            farmId: cow.farm_id,
            weight_kg: cow.weight_kg,
            age_months: cow.age_months,
            lactation_days: cow.lactation_days,
            temperature: cowRecords[0]?.temperature || 22,
            udder_humidity: cowRecords[0]?.udder_humidity || 70,
            feed_amount: cowRecords[0]?.feed_amount || 15,
            weekly_feed_kg: cowRecords[0]?.weekly_feed_kg || 100,
            breed: cow.breed,
            recentProductions
          });

          const prediction = result.prediction;
          const actualProduction = productionData[cow.id] || 0;
          const accuracy = calculateAccuracy(prediction, actualProduction);
          
          // Save prediction
          const newPrediction = {
            id: `pred-${cow.id}-${Date.now()}`,
            cow_id: cow.id,
            predicted_production: prediction,
            actual_production: actualProduction,
            prediction_date: new Date().toISOString().split('T')[0],
            presicion: accuracy,
            created_at: new Date().toISOString()
          };
          
          setPredictions(prev => [newPrediction, ...prev]);

          results.push({
            cowId: cow.id,
            cowName: cow.name,
            prediction,
            actual: actualProduction,
            accuracy
          });
          
          total += prediction;
        }
      }

      setBulkPredictionResults(results);
      setTotalHerdPrediction(total);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al realizar las predicciones');
    }
  };

  const handleStatusChange = async (cowId: string, newStatus: 'active' | 'inactive' | 'treatment') => {
    try {
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
      const newCow: Cow = {
        id: `cow-${Date.now()}`,
        farm_id: 'farm-1',
        name: newCowData.name,
        weight_kg: newCowData.weight_kg,
        age_months: newCowData.age_months,
        lactation_days: newCowData.lactation_days,
        breed: newCowData.breed,
        avg_production: newCowData.avg_production,
        status: newCowData.status,
        milking_status: newCowData.milking_status,
        exclusion_reason: newCowData.exclusion_reason,
        created_at: new Date().toISOString()
      };

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

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Predicciones de Producción</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowModelDetails(!showModelDetails)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            <Info className="h-5 w-5 mr-2" />
            {showModelDetails ? 'Ocultar Info de Modelos' : 'Info de Modelos'}
          </button>
          <button
            onClick={() => setShowAllCows(!showAllCows)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Milk className="h-5 w-5 mr-2" />
            {showAllCows ? 'Ocultar Vacas' : 'Ver Todas las Vacas'}
          </button>
          <button
            onClick={() => setShowNewCowForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Agregar Vaca
          </button>
        </div>
      </div>

      {showModelDetails && (
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <ModelDetails modelId={selectedModel} />
          <ModelComparison />
        </div>
      )}

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
                  <tr key={cow.id} className="hover:bg-gray-50 transition-colors">
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
                        className="text-blue-600 hover:text-blue-800 transition-colors"
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

      <PredictionsTable 
        predictions={predictions}
        cows={cows}
        showPredictionsTable={showPredictionsTable}
        toggleShowPredictions={() => setShowPredictionsTable(!showPredictionsTable)}
      />

      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Seleccionar Vaca
        </label>
        <select
          value={selectedCow || ''}
          onChange={(e) => setSelectedCow(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Seleccione una vaca</option>
          {cows.map(cow => (
            <option key={cow.id} value={cow.id}>
              {cow.name} - {cow.breed}
            </option>
          ))}
        </select>
      </div>

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

          <form onSubmit={handleDailyDataSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Producción (L)
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={dailyData.udder_humidity}
                onChange={(e) => setDailyData({...dailyData, udder_humidity: Number(e.target.value)})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alimento Semanal (kg)
              </label>
              <input
                type="number"
                step="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={dailyData.weekly_feed_kg}
                onChange={(e) => setDailyData({...dailyData, weekly_feed_kg: Number(e.target.value)})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sesión
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={dailyData.session}
                onChange={(e) => setDailyData({...dailyData, session: e.target.value as 'Mañana' | 'Tarde'})}
                required
              >
                <option value="Mañana">Mañana</option>
                <option value="Tarde">Tarde</option>
              </select>
            </div>
            <div className="sm:col-span-2 md:col-span-3 lg:col-span-4 flex justify-end">
              <button
                type="submit"
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Save className="h-5 w-5 mr-2" />
                Guardar Datos
              </button>
            </div>
          </form>

          <PredictionControls
            models={predictionModels}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            onPredictCow={predictNextMilking}
            onPredictHerd={predictAllCows}
            isCowSelected={Boolean(selectedCow)}
            className="mt-8"
          />
          
          {predictionResult !== null && selectedCow && (
            <PredictionResult
              cowName={cows.find(cow => cow.id === selectedCow)?.name}
              predictedProduction={predictionResult}
              actualProduction={productionData[selectedCow] || 0}
              accuracy={predictionAccuracy || undefined}
              className="mt-6"
            />
          )}

          {bulkPredictionResults.length > 0 && (
            <HerdPredictionResults
              results={bulkPredictionResults}
              totalPrediction={totalHerdPrediction}
              className="mt-6"
            />
          )}

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
                      <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(record.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.session}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.production_liters.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.temperature.toFixed(1)}°C</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.udder_humidity.toFixed(0)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {showNewCowForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-2xl font-bold mb-4">Agregar Nueva Vaca</h3>
            <form onSubmit={handleNewCowSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  value={newCowData.name}
                  onChange={(e) => setNewCowData({...newCowData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  step="0.1"
                  value={newCowData.avg_production}
                  onChange={(e) => setNewCowData({...newCowData, avg_production: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="col-span-1 sm:col-span-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowNewCowForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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

export default Predictions;