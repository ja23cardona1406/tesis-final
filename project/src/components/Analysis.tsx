import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { supabase } from '../lib/supabase';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area
} from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { 
  Activity,
  RefreshCw
} from 'lucide-react';

interface AnalyticsData {
  date: string;
  actual: number;
  predicted: number;
  difference: number;
  accuracy: number;
}

const Analytics = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [selectedCow, setSelectedCow] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<number>(7);
  const [chartType, setChartType] = useState<'line' | 'bar' | 'composed'>('line');
  const [cows, setCows] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summaryStats, setSummaryStats] = useState({
    totalPredictions: 0,
    averageAccuracy: 0,
    bestPrediction: 0,
    worstPrediction: 0
  });

  useEffect(() => {
    fetchCows();
  }, [user]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedCow, timeRange]);

  const calculateAccuracy = (predicted: number, actual: number): number => {
    if (actual === 0) return 0;
    const accuracy = 100 - Math.abs((predicted - actual) / actual * 100);
    return Math.max(0, Math.min(100, accuracy));
  };

  const fetchCows = async () => {
    try {
      const { data: farmMembers, error: farmError } = await supabase
        .from('farm_members')
        .select('farm_id')
        .eq('user_id', user?.id)
        .eq('status', 'approved')
        .single();

      if (farmError) throw farmError;

      const { data, error } = await supabase
        .from('cows')
        .select('*')
        .eq('farm_id', farmMembers.farm_id)
        .eq('status', 'active');

      if (error) throw error;
      setCows(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar las vacas');
    }
  };

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const endDate = endOfDay(new Date());
      const startDate = startOfDay(subDays(endDate, timeRange));

      let query = supabase
        .from('predictions')
        .select('*')
        .gte('prediction_date', startDate.toISOString())
        .lte('prediction_date', endDate.toISOString());

      if (selectedCow !== 'all') {
        query = query.eq('cow_id', selectedCow);
      }

      const { data, error } = await query;

      if (error) throw error;

      const processedData = data.map(record => ({
        date: format(new Date(record.prediction_date), 'yyyy-MM-dd'),
        actual: record.actual_production,
        predicted: record.predicted_production,
        difference: record.predicted_production - record.actual_production,
        accuracy: calculateAccuracy(record.predicted_production, record.actual_production)
      }));

      setAnalyticsData(processedData);

      // Calcular estadísticas
      if (processedData.length > 0) {
        const stats = {
          totalPredictions: processedData.length,
          averageAccuracy: processedData.reduce((acc, curr) => acc + curr.accuracy, 0) / processedData.length,
          bestPrediction: Math.max(...processedData.map(d => d.accuracy)),
          worstPrediction: Math.min(...processedData.map(d => d.accuracy))
        };
        setSummaryStats(stats);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los datos analíticos');
    } finally {
      setLoading(false);
    }
  };

  const renderChart = () => {
    if (!analyticsData.length) return null;

    const commonProps = {
      width: 500,
      height: 300,
      data: analyticsData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="actual" fill="#4f46e5" name="Producción Real" />
              <Bar dataKey="predicted" fill="#7c3aed" name="Predicción" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'composed':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="actual" fill="#4f46e5" stroke="#4338ca" name="Producción Real" />
              <Line type="monotone" dataKey="predicted" stroke="#7c3aed" name="Predicción" />
            </ComposedChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="actual" stroke="#4f46e5" name="Producción Real" />
              <Line type="monotone" dataKey="predicted" stroke="#7c3aed" name="Predicción" />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Análisis de Predicciones</h2>
        <button
          onClick={fetchAnalyticsData}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <RefreshCw className="h-5 w-5 mr-2" />
          Actualizar Datos
        </button>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar Vaca
          </label>
          <select
            value={selectedCow}
            onChange={(e) => setSelectedCow(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="all">Todas las Vacas</option>
            {cows.map(cow => (
              <option key={cow.id} value={cow.id}>
                {cow.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rango de Tiempo
          </label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value={7}>Última Semana</option>
            <option value={15}>Últimos 15 días</option>
            <option value={30}>Último Mes</option>
            <option value={90}>Últimos 3 Meses</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Gráfico
          </label>
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value as 'line' | 'bar' | 'composed')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="line">Líneas</option>
            <option value="bar">Barras</option>
            <option value="composed">Compuesto</option>
          </select>
        </div>
      </div>

      {/* Estadísticas Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Total Predicciones</h3>
            <Activity className="h-6 w-6 text-indigo-600" />
          </div>
          <p className="mt-2 text-3xl font-bold text-indigo-600">
            {summaryStats.totalPredictions}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Precisión Promedio</h3>
            <Activity className="h-6 w-6 text-green-600" />
          </div>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {summaryStats.averageAccuracy.toFixed(2)}%
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Mejor Predicción</h3>
            <Activity className="h-6 w-6 text-blue-600" />
          </div>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            {summaryStats.bestPrediction.toFixed(2)}%
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Peor Predicción</h3>
            <Activity className="h-6 w-6 text-red-600" />
          </div>
          <p className="mt-2 text-3xl font-bold text-red-600">
            {summaryStats.worstPrediction.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Gráfico Principal */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-semibold mb-6">Comparativa de Predicciones vs Realidad</h3>
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : analyticsData.length > 0 ? (
          renderChart()
        ) : (
          <div className="flex justify-center items-center h-96">
            <p className="text-gray-500">No hay datos disponibles para mostrar</p>
          </div>
        )}
      </div>

      {/* Tabla de Datos */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Detalles de Predicciones</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producción Real (L)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Predicción (L)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Diferencia (L)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precisión (%)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analyticsData.map((record, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">{record.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{record.actual.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{record.predicted.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={record.difference > 0 ? 'text-green-600' : 'text-red-600'}>
                      {record.difference.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{record.accuracy.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;