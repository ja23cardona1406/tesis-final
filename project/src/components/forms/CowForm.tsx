import React, { useState } from 'react';
import { Save, X } from 'lucide-react';
import { Cow } from '../../lib/types';

interface CowFormProps {
  initialData?: Omit<Cow, 'id' | 'created_at' | 'farm_id'>;
  onSubmit: (data: Omit<Cow, 'id' | 'created_at' | 'farm_id'>) => void;
  onCancel: () => void;
}

const defaultCowData = {
  name: '',
  weight_kg: 0,
  age_months: 0,
  lactation_days: 0,
  breed: '',
  avg_production: 0,
  status: 'active' as const,
  milking_status: true,
  exclusion_reason: ''
};

const CowForm: React.FC<CowFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [cowData, setCowData] = useState<Omit<Cow, 'id' | 'created_at' | 'farm_id'>>(
    initialData || defaultCowData
  );

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validate = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!cowData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }
    
    if (cowData.weight_kg <= 0) {
      newErrors.weight_kg = 'El peso debe ser mayor a 0';
    }
    
    if (cowData.age_months < 0) {
      newErrors.age_months = 'La edad no puede ser negativa';
    }
    
    if (!cowData.breed) {
      newErrors.breed = 'La raza es obligatoria';
    }
    
    if (cowData.avg_production < 0) {
      newErrors.avg_production = 'La producción promedio no puede ser negativa';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setCowData({
        ...cowData,
        [name]: checked
      });
    } else if (type === 'number') {
      setCowData({
        ...cowData,
        [name]: parseFloat(value) || 0
      });
    } else {
      setCowData({
        ...cowData,
        [name]: value
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      onSubmit(cowData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre
        </label>
        <input
          type="text"
          name="name"
          value={cowData.name}
          onChange={handleChange}
          className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
          required
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Peso (kg)
        </label>
        <input
          type="number"
          name="weight_kg"
          value={cowData.weight_kg}
          onChange={handleChange}
          className={`w-full px-3 py-2 border ${errors.weight_kg ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
          required
        />
        {errors.weight_kg && <p className="text-red-500 text-xs mt-1">{errors.weight_kg}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Edad (meses)
        </label>
        <input
          type="number"
          name="age_months"
          value={cowData.age_months}
          onChange={handleChange}
          className={`w-full px-3 py-2 border ${errors.age_months ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
          required
        />
        {errors.age_months && <p className="text-red-500 text-xs mt-1">{errors.age_months}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Días de lactancia
        </label>
        <input
          type="number"
          name="lactation_days"
          value={cowData.lactation_days}
          onChange={handleChange}
          className={`w-full px-3 py-2 border ${errors.lactation_days ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
          required
        />
        {errors.lactation_days && <p className="text-red-500 text-xs mt-1">{errors.lactation_days}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Raza
        </label>
        <select
          name="breed"
          value={cowData.breed}
          onChange={handleChange}
          className={`w-full px-3 py-2 border ${errors.breed ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
          required
        >
          <option value="">Seleccione una raza</option>
          <option value="Holstein">Holstein</option>
          <option value="Jersey">Jersey</option>
          <option value="Guernsey">Guernsey</option>
          <option value="Brown Swiss">Brown Swiss</option>
          <option value="Ayrshire">Ayrshire</option>
        </select>
        {errors.breed && <p className="text-red-500 text-xs mt-1">{errors.breed}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Producción promedio (L)
        </label>
        <input
          type="number"
          name="avg_production"
          step="0.1"
          value={cowData.avg_production}
          onChange={handleChange}
          className={`w-full px-3 py-2 border ${errors.avg_production ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
          required
        />
        {errors.avg_production && <p className="text-red-500 text-xs mt-1">{errors.avg_production}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Estado
        </label>
        <select
          name="status"
          value={cowData.status}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="active">Activa</option>
          <option value="inactive">Inactiva</option>
          <option value="treatment">En tratamiento</option>
        </select>
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          name="milking_status"
          checked={cowData.milking_status}
          onChange={handleChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label className="ml-2 block text-sm text-gray-700">
          En ordeño
        </label>
      </div>
      
      <div className="sm:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Razón de exclusión (si aplica)
        </label>
        <input
          type="text"
          name="exclusion_reason"
          value={cowData.exclusion_reason || ''}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Dejar en blanco si la vaca está activa"
        />
      </div>
      
      <div className="sm:col-span-2 flex justify-end gap-3 mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <X className="h-5 w-5 mr-2" />
          Cancelar
        </button>
        <button
          type="submit"
          className="flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-medium text-white hover:bg-blue-700"
        >
          <Save className="h-5 w-5 mr-2" />
          Guardar
        </button>
      </div>
    </form>
  );
};

export default CowForm;