import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createRecord } from '../store/slices/recordSlice';
import { AppDispatch } from '../store/store';

interface FormData {
  cowId: string;
  farmId: string;
  milking_session: 'morning' | 'afternoon' | 'evening';
  production_liters: number;
  temperature: number;
  humidity: number;
  feed_amount: number;
}

const DataEntryForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [formData, setFormData] = useState<FormData>({
    cowId: '',
    farmId: '',
    milking_session: 'morning',
    production_liters: 0,
    temperature: 25,
    humidity: 60,
    feed_amount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'production_liters' || name === 'temperature' || name === 'humidity' || name === 'feed_amount' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await dispatch(createRecord(formData)).unwrap();
      setSuccess(true);
      setFormData({
        cowId: '',
        farmId: '',
        milking_session: 'morning',
        production_liters: 0,
        temperature: 25,
        humidity: 60,
        feed_amount: 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar los datos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Registro de Datos</h3>
      {error && <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">{error}</div>}
      {success && <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-md">Datos guardados exitosamente</div>}
      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">ID de la Vaca</label>
          <input type="text" name="cowId" value={formData.cowId} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">ID de la Granja</label>
          <input type="text" name="farmId" value={formData.farmId} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sesión de Ordeño</label>
          <select name="milking_session" value={formData.milking_session} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" required>
            <option value="morning">Mañana</option>
            <option value="afternoon">Tarde</option>
            <option value="evening">Noche</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Producción Diaria (Litros)</label>
          <input type="number" name="production_liters" value={formData.production_liters} onChange={handleInputChange} step="0.01" min="0" className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Temperatura Ambiente (°C)</label>
          <input type="number" name="temperature" value={formData.temperature} onChange={handleInputChange} step="0.1" min="-10" max="50" className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Humedad Relativa (%)</label>
          <input type="number" name="humidity" value={formData.humidity} onChange={handleInputChange} min="0" max="100" className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad de Alimento (kg)</label>
          <input type="number" name="feed_amount" value={formData.feed_amount} onChange={handleInputChange} step="0.01" min="0" className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
        </div>
        <div className="md:col-span-2">
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-400">
            {loading ? 'Guardando...' : 'Registrar Datos'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DataEntryForm;
