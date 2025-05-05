import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Save, 
  Plus, 
  Milk, 
  Calculator,
  Pencil,
  Trash,
  X,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { supabase, getCurrentUser } from '../lib/supabase';
import { 
  Cow, 
  DairyRecord, 
  Prediction, 
  BulkPredictionResult,
  User
} from '../lib/types';
import { predictionModels } from '../../models/model';
import { 
  predictMilkProduction, 
  savePrediction, 
  getPredictions,
  calculateAccuracy 
} from '../lib/predictionService';
import PredictionsTable from './fastApi/PredictionsTable';
import PredictionControls from './fastApi/PredictionControls';
import PredictionResult from './fastApi/PredictionResult';
import HerdPredictionResults from './fastApi/HerdPredictionResults';
import ModelDetails from './ModelDetails';
import ModelComparison from './ModelComparison';
import CowForm from './forms/CowForm';
import DairyRecordForm from './forms/DairyRecordForm';
import ConfirmationModal from './ui/ConfirmationModal';

function Predictions() {
  const [user, setUser] = useState<User | null>(null);
  
  const [selectedCow, setSelectedCow] = useState<string | null>(null);
  const [cows, setCows] = useState<Cow[]>([]);
  const [dairyRecords, setDairyRecords] = useState<DairyRecord[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [predictionsLoading, setPredictionsLoading] = useState(false);
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
  const [cowToEdit, setCowToEdit] = useState<Cow | null>(null);
  const [recordToEdit, setRecordToEdit] = useState<DairyRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<DairyRecord | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // Load saved production data from localStorage
  useEffect(() => {
    const storedData = localStorage.getItem('cowProductionData');
    if (storedData) {
      setProductionData(JSON.parse(storedData));
    }
  }, []);

  // Fetch the current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser({
            id: currentUser.id,
            email: currentUser.email || undefined
          });
        } else {
          setError("No se ha iniciado sesión. Por favor inicie sesión para continuar.");
        }
      } catch (err) {
        console.error("Error al obtener el usuario:", err);
        setError("Error al obtener la información del usuario");
      }
    };

    fetchUser();
  }, []);

  // Fetch cows from Supabase
  useEffect(() => {
    const fetchCows = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('cows')
          .select('*')
          .order('name', { ascending: true });

        if (error) throw error;
        
        if (data) {
          setCows(data as Cow[]);
          
          // Calculate total production
          let total = 0;
          for (const cow of data) {
            if (cow.status === 'active' && cow.milking_status) {
              total += cow.avg_production || 0;
            }
          }
          setTotalProduction(total);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching cows');
        console.error('Error fetching cows:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCows();
  }, []);

  // Fetch predictions from Supabase
  useEffect(() => {
    const fetchPredictions = async () => {
      setPredictionsLoading(true);
      try {
        // Fetch predictions for the selected cow or all predictions if no cow is selected
        const data = await getPredictions(selectedCow || undefined);
        setPredictions(data);
      } catch (err) {
        console.error('Error fetching predictions:', err);
        // Don't set error state here to avoid overwhelming the user with notifications
      } finally {
        setPredictionsLoading(false);
      }
    };

    fetchPredictions();
  }, [selectedCow]);

  // Fetch dairy records for selected cow
  useEffect(() => {
    if (selectedCow) {
      fetchDairyRecordsForCow(selectedCow);
    }
  }, [selectedCow]);

  const fetchDairyRecordsForCow = async (cowId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('dairy_records')
        .select('*')
        .eq('cow_id', cowId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      if (data) {
        setDairyRecords(data as DairyRecord[]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching dairy records');
      console.error('Error fetching dairy records:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDailyDataSubmit = async (dailyData: {
    production_liters: number;
    temperature: number;
    feed_amount: number;
    udder_humidity: number;
    session: 'Mañana' | 'Tarde';
  }) => {
    if (!selectedCow || !user) {
      setError("Se requiere iniciar sesión y seleccionar una vaca");
      return;
    }

    try {
      // Get the current user
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        setError("Se requiere iniciar sesión para guardar datos");
        return;
      }

      // Save to Supabase
      const { data, error } = await supabase
        .from('dairy_records')
        .insert([{
          user_id: currentUser.id, // Use the real user ID from authentication
          cow_id: selectedCow,
          production_liters: Number(dailyData.production_liters),
          temperature: Number(dailyData.temperature),
          feed_amount: Number(dailyData.feed_amount),
          udder_humidity: Number(dailyData.udder_humidity),
          session: dailyData.session
        }])
        .select();

      if (error) throw error;

      // Update local state with the newly created record
      if (data && data.length > 0) {
        setDairyRecords([data[0] as DairyRecord, ...dairyRecords]);
      }
      
      // Store in local storage
      const updatedProductionData = {
        ...productionData,
        [selectedCow]: dailyData.production_liters
      };
      localStorage.setItem('cowProductionData', JSON.stringify(updatedProductionData));
      setProductionData(updatedProductionData);

      // Update total production
      setTotalProduction(totalProduction + dailyData.production_liters);

      showMessage('Registro guardado exitosamente', 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar los datos');
      console.error('Error saving dairy record:', err);
    }
  };

  const handleEditDairyRecord = async (updatedRecord: DairyRecord) => {
    try {
      const { error } = await supabase
        .from('dairy_records')
        .update({
          production_liters: Number(updatedRecord.production_liters),
          temperature: Number(updatedRecord.temperature),
          feed_amount: Number(updatedRecord.feed_amount),
          udder_humidity: Number(updatedRecord.udder_humidity),
          session: updatedRecord.session
        })
        .eq('id', updatedRecord.id);

      if (error) throw error;

      // Update local state
      setDairyRecords(dairyRecords.map(record => 
        record.id === updatedRecord.id ? updatedRecord : record
      ));

      setRecordToEdit(null);
      showMessage('Registro actualizado correctamente', 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el registro');
      console.error('Error updating dairy record:', err);
    }
  };

  const handleDeleteDairyRecord = async () => {
    if (!recordToDelete) return;
  
    try {
      console.log('Intentando eliminar registro con ID:', recordToDelete.id);
      console.log('Tipo de ID:', typeof recordToDelete.id);
      
      // Primero verificamos si el registro existe
      const { data: existingRecord, error: fetchError } = await supabase
        .from('dairy_records')
        .select('*')
        .eq('id', recordToDelete.id)
        .single();
      
      if (fetchError) {
        console.error('Error al buscar el registro:', fetchError);
        throw new Error(`No se pudo verificar el registro: ${fetchError.message}`);
      }
      
      if (!existingRecord) {
        throw new Error('El registro que intentas eliminar no existe en la base de datos');
      }
      
      console.log('Registro encontrado:', existingRecord);
      
      // Ahora intentamos eliminar
      const { error: deleteError, data: deleteData } = await supabase
        .from('dairy_records')
        .delete()
        .eq('id', recordToDelete.id)
        .select();
  
      if (deleteError) {
        console.error('Error de Supabase al eliminar:', deleteError);
        throw deleteError;
      }
      
      console.log('Respuesta de eliminación:', deleteData);
      
      if (!deleteData || deleteData.length === 0) {
        throw new Error('La operación de eliminación no afectó ningún registro');
      }
  
      // Actualizar estado local
      setDairyRecords(dairyRecords.filter(record => record.id !== recordToDelete.id));
      
      setRecordToDelete(null);
      setShowDeleteConfirmation(false);
      showMessage('Registro eliminado correctamente', 'success');
    } catch (err) {
      console.error('Error completo:', err);
      setError(err instanceof Error ? err.message : 'Error al eliminar el registro');
      showMessage(`Error: ${err instanceof Error ? err.message : 'Error desconocido'}`, 'error');
    }
  };

  const handleCowSubmit = async (cowData: Omit<Cow, 'id' | 'created_at' | 'farm_id'>) => {
    try {
      if (cowToEdit) {
        // Update existing cow
        const { error } = await supabase
          .from('cows')
          .update({
            name: cowData.name,
            weight_kg: cowData.weight_kg,
            age_months: cowData.age_months,
            lactation_days: cowData.lactation_days,
            breed: cowData.breed,
            avg_production: cowData.avg_production,
            status: cowData.status,
            milking_status: cowData.milking_status,
            exclusion_reason: cowData.exclusion_reason || null
          })
          .eq('id', cowToEdit.id);

        if (error) throw error;

        // Update local state
        setCows(cows.map(cow => 
          cow.id === cowToEdit.id ? { ...cow, ...cowData } : cow
        ));
        
        showMessage('Vaca actualizada correctamente', 'success');
      } else {
        // Get a reference cow to get a valid farm_id
        let farmId = null;
        if (cows.length > 0) {
          farmId = cows[0].farm_id;
        }
        
        if (!farmId) {
          throw new Error('No se pudo determinar un farm_id válido');
        }
        
        // Create new cow with the valid farm_id
        const { data, error } = await supabase
          .from('cows')
          .insert([{
            farm_id: farmId,
            name: cowData.name,
            weight_kg: cowData.weight_kg,
            age_months: cowData.age_months,
            lactation_days: cowData.lactation_days,
            breed: cowData.breed,
            avg_production: cowData.avg_production,
            status: cowData.status,
            milking_status: cowData.milking_status,
            exclusion_reason: cowData.exclusion_reason || null
          }])
          .select();

        if (error) throw error;

        // Update local state with the newly created cow
        if (data && data.length > 0) {
          setCows([...cows, data[0] as Cow]);
          showMessage('Vaca creada correctamente', 'success');
        }
      }
      
      // Reset form state
      setCowToEdit(null);
      setShowNewCowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar los datos de la vaca');
      console.error('Error with cow data:', err);
    }
  };

  const editCow = (cow: Cow) => {
    setCowToEdit(cow);
    setShowNewCowForm(true);
  };

  const editDairyRecord = (record: DairyRecord) => {
    setRecordToEdit(record);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setCowToEdit(null);
    setRecordToEdit(null);
    setIsEditing(false);
    setShowNewCowForm(false);
  };

  const confirmDeleteRecord = (record: DairyRecord) => {
    setRecordToDelete(record);
    setShowDeleteConfirmation(true);
  };

  const showMessage = (message: string, type: 'success' | 'error' = 'error') => {
    if (type === 'error') {
      setError(message);
      setTimeout(() => setError(null), 5000);
    } else {
      setError(null);
      // You could implement a success message system here
      // For now we're just using alerts
      alert(message);
    }
  };

  // Save prediction to Supabase and local state
  const savePredictionToDatabase = async (
    cowId: string,
    predictedProduction: number,
    actualProduction: number | null = null
  ) => {
    try {
      const accuracy = actualProduction !== null 
        ? calculateAccuracy(predictedProduction, actualProduction) 
        : null;
      
      const newPrediction = {
        cow_id: cowId,
        predicted_production: predictedProduction,
        actual_production: actualProduction,
        prediction_date: new Date().toISOString().split('T')[0],
        presicion: accuracy
      };
      
      // Save to Supabase
      const savedPrediction = await savePrediction(newPrediction);
      
      // Update local state
      setPredictions([savedPrediction, ...predictions]);
      
      return savedPrediction;
    } catch (err) {
      console.error('Error saving prediction:', err);
      throw new Error('Error al guardar la predicción en la base de datos');
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
        breed: selectedCowData.breed,
        recentProductions
      });

      const prediction = result.prediction;
      const actualProduction = productionData[selectedCow] || null;
      const accuracy = actualProduction !== null ? calculateAccuracy(prediction, actualProduction) : null;

      // Save prediction to Supabase
      await savePredictionToDatabase(selectedCow, prediction, actualProduction);
      
      setPredictionResult(prediction);
      setPredictionAccuracy(accuracy);
      
      showMessage('Predicción realizada y guardada correctamente', 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al realizar la predicción');
      console.error('Error making prediction:', err);
    }
  };

  const predictAllCows = async () => {
    try {
      const results: BulkPredictionResult[] = [];
      let total = 0;

      for (const cow of cows) {
        if (cow.status === 'active' && cow.milking_status) {
          // Fetch recent records for this cow
          const { data: cowRecords, error } = await supabase
            .from('dairy_records')
            .select('*')
            .eq('cow_id', cow.id)
            .order('created_at', { ascending: false })
            .limit(7);
            
          if (error) throw error;
          
          // Get recent production data for this cow
          const recentProductions = cowRecords
            ? (cowRecords as DairyRecord[]).map((record: DairyRecord) => record.production_liters)
            : [cow.avg_production]; // Use average production if no records
            
          // Make prediction
          const result = await predictMilkProduction({
            cowId: cow.id,
            modelId: selectedModel,
            farmId: cow.farm_id,
            weight_kg: cow.weight_kg,
            age_months: cow.age_months,
            lactation_days: cow.lactation_days,
            temperature: cowRecords && cowRecords[0]?.temperature || 22,
            udder_humidity: cowRecords && cowRecords[0]?.udder_humidity || 70,
            feed_amount: cowRecords && cowRecords[0]?.feed_amount || 15,
            breed: cow.breed,
            recentProductions
          });

          // Calculate accuracy and save prediction
          const actual = productionData[cow.id] || null;
          const accuracy = actual !== null ? calculateAccuracy(result.prediction, actual) : null;
          
          // Save prediction to Supabase
          await savePredictionToDatabase(cow.id, result.prediction, actual);
          
          // Add to results
          results.push({
            cowId: cow.id,
            cowName: cow.name,
            prediction: result.prediction,
            actual: actual || 0,
            accuracy: accuracy || 0
          });
          
          total += result.prediction;
        }
      }

      setBulkPredictionResults(results);
      setTotalHerdPrediction(total);
      
      showMessage('Predicciones para todo el rebaño realizadas y guardadas correctamente', 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al realizar las predicciones');
      console.error('Error making bulk predictions:', err);
    }
  };

  const handleStatusChange = async (cowId: string, newStatus: 'active' | 'inactive' | 'treatment') => {
    try {
      // Update in Supabase
      const { error } = await supabase
        .from('cows')
        .update({ status: newStatus })
        .eq('id', cowId);

      if (error) throw error;

      // Update local state
      setCows(cows.map(cow => 
        cow.id === cowId ? { ...cow, status: newStatus } : cow
      ));
      
      showMessage(`Estado actualizado a ${newStatus}`, 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el estado');
      console.error('Error updating cow status:', err);
    }
  };

  if (loading && cows.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show authentication required message if no user is logged in
  if (!user && !loading) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-center text-red-600 mb-4">
          <AlertTriangle className="h-8 w-8 mr-2" />
        </div>
        <h2 className="text-xl font-semibold text-center mb-4">Acceso Restringido</h2>
        <p className="text-gray-600 mb-6 text-center">
          Debe iniciar sesión para acceder a las predicciones y registro de datos.
        </p>
        <div className="flex justify-center">
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            onClick={() => window.location.href = '/login'}
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center text-red-700">
          <AlertTriangle className="h-5 w-5 mr-2" />
          {error}
          <button
            className="ml-auto text-sm text-red-600 hover:text-red-800"
            onClick={() => setError(null)}
          >
            Cerrar
          </button>
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
            <Milk className="h-5 w-5 mr-2" />
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
            onClick={() => {
              setCowToEdit(null);
              setShowNewCowForm(true);
            }}
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
                      <div className="flex gap-2">
                        <button
                          onClick={() => editCow(cow)}
                          className="text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                          <Pencil className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setSelectedCow(cow.id)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          Seleccionar
                        </button>
                      </div>
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
        loading={predictionsLoading}
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
            <div className="flex items-center gap-3">
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
              <button 
                onClick={() => editCow(cows.find(cow => cow.id === selectedCow)!)}
                className="flex items-center p-2 text-indigo-600 hover:text-indigo-800"
              >
                <Pencil className="h-5 w-5" />
              </button>
            </div>
          </div>

          {recordToEdit ? (
            <div className="mb-6 p-4 border border-blue-200 rounded-lg bg-blue-50">
              <div className="flex justify-between mb-4">
                <h4 className="font-semibold text-blue-800">Editar Registro</h4>
                <button 
                  onClick={() => {
                    setRecordToEdit(null);
                    setIsEditing(false);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <DairyRecordForm 
                initialData={recordToEdit}
                onSubmit={handleEditDairyRecord}
                onCancel={() => {
                  setRecordToEdit(null);
                  setIsEditing(false);
                }}
                isEditing={true}
              />
            </div>
          ) : (
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-4">Registrar Nuevo Ordeño</h4>
              <DairyRecordForm 
                onSubmit={handleDailyDataSubmit}
              />
            </div>
          )}

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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <button
                              onClick={() => editDairyRecord(record)}
                              className="text-indigo-600 hover:text-indigo-800"
                            >
                              <Pencil className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => confirmDeleteRecord(record)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* New/Edit Cow Form Modal */}
      {showNewCowForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold">
                {cowToEdit ? 'Editar Vaca' : 'Agregar Nueva Vaca'}
              </h3>
              <button
                onClick={cancelEditing}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <CowForm 
              initialData={cowToEdit || undefined}
              onSubmit={handleCowSubmit}
              onCancel={cancelEditing}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <ConfirmationModal
          title="Confirmar Eliminación"
          message={`¿Está seguro que desea eliminar este registro de ordeño?`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          onConfirm={handleDeleteDairyRecord}
          onCancel={() => {
            setRecordToDelete(null);
            setShowDeleteConfirmation(false);
          }}
        />
      )}
    </div>
  );
}

export default Predictions;