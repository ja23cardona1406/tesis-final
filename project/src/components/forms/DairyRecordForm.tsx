import React, { useState } from 'react';
import { Save, X } from 'lucide-react';
import { DairyRecord } from '../../lib/types';

interface DairyRecordFormProps {
  initialData?: DairyRecord;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  isEditing?: boolean;
}

const defaultDairyData = {
  production_liters: 0,
  temperature: 22,
  feed_amount: 15,
  udder_humidity: 70,
  session: 'Mañana' as 'Mañana' | 'Tarde'
};

const DairyRecordForm: React.FC<DairyRecordFormProps> = ({ 
  initialData, 
  onSubmit, 
  onCancel,
  isEditing = false 
}) => {
  const [dairyData, setDairyData] = useState<Omit<DairyRecord, 'id' | 'created_at' | 'user_id' | 'cow_id'>>(
    initialData ? {
      production_liters: initialData.production_liters,
      temperature: initialData.temperature,
      feed_amount: initialData.feed_amount,
      udder_humidity: initialData.udder_humidity,
      session: initialData.session
    } : defaultDairyData
  );

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validate = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (dairyData.production_liters < 0) {
      newErrors.production_liters = 'La producción no puede ser negativa';
    }
    
    if (dairyData.temperature < 0 || dairyData.temperature > 50) {
      newErrors.temperature = 'La temperatura debe estar entre 0 y 50°C';
    }
    
    if (dairyData.feed_amount < 0) {
      newErrors.feed_amount = 'La cantidad de alimento no puede ser negativa';
    }
    
    if (dairyData.udder_humidity < 0 || dairyData.udder_humidity > 100) {
      newErrors.udder_humidity = 'La humedad debe estar entre 0 y 100%';
    }
    
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setDairyData({
        ...dairyData,
        [name]: parseFloat(value) || 0
      });
    } else {
      setDairyData({
        ...dairyData,
        [name]: value
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      if (isEditing && initialData) {
        onSubmit({
          ...initialData,
          ...dairyData
        });
      } else {
        onSubmit(dairyData);
      }
      
      // Reset form if not editing
      if (!isEditing) {
        setDairyData(defaultDairyData);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Producción (L)
        </label>
        <input
          type="number"
          name="production_liters"
          step="0.01"
          value={dairyData.production_liters}
          onChange={handleChange}
          className={`w-full px-3 py-2 border ${errors.production_liters ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
          required
        />
        {errors.production_liters && <p className="text-red-500 text-xs mt-1">{errors.production_liters}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Temperatura (°C)
        </label>
        <input
          type="number"
          name="temperature"
          step="0.1"
          value={dairyData.temperature}
          onChange={handleChange}
          className={`w-full px-3 py-2 border ${errors.temperature ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
          required
        />
        {errors.temperature && <p className="text-red-500 text-xs mt-1">{errors.temperature}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Alimento semanal (kg)
        </label>
        <input
          type="number"
          name="feed_amount"
          step="0.1"
          value={dairyData.feed_amount}
          onChange={handleChange}
          className={`w-full px-3 py-2 border ${errors.feed_amount ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
          required
        />
        {errors.feed_amount && <p className="text-red-500 text-xs mt-1">{errors.feed_amount}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Humedad Ubre (%)
        </label>
        <input
          type="number"
          name="udder_humidity"
          step="1"
          value={dairyData.udder_humidity}
          onChange={handleChange}
          className={`w-full px-3 py-2 border ${errors.udder_humidity ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
          required
        />
        {errors.udder_humidity && <p className="text-red-500 text-xs mt-1">{errors.udder_humidity}</p>}
      </div>
      
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Sesión
        </label>
        <select
          name="session"
          value={dairyData.session}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option value="Mañana">Mañana</option>
          <option value="Tarde">Tarde</option>
        </select>
      </div>
      
      <div className="sm:col-span-2 md:col-span-3 flex justify-end gap-3 mt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <X className="h-5 w-5 mr-2" />
            Cancelar
          </button>
        )}
        <button
          type="submit"
          className="flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-medium text-white hover:bg-green-700"
        >
          <Save className="h-5 w-5 mr-2" />
          {isEditing ? 'Actualizar' : 'Guardar Datos'}
        </button>
      </div>
    </form>
  );
};

export default DairyRecordForm;