import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { fetchCows } from '../store/slices/cowSlice';
import { fetchRecords } from '../store/slices/recordSlice';

const Dashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentFarm } = useSelector((state: RootState) => state.farm);
  const { cows } = useSelector((state: RootState) => state.cow);
  const { records } = useSelector((state: RootState) => state.record);

  useEffect(() => {
    if (currentFarm?._id) {
      dispatch(fetchCows(currentFarm._id));
      dispatch(fetchRecords({ farmId: currentFarm._id }));
    }
  }, [dispatch, currentFarm]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Panel de Control</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Resumen de Producción */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Producción Total</h3>
          <p className="text-3xl font-bold text-blue-600">
            {records.reduce((sum, record) => sum + record.production_liters, 0).toFixed(2)} L
          </p>
          <p className="text-gray-600 mt-2">Últimas 24 horas</p>
        </div>

        {/* Vacas Activas */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Vacas Activas</h3>
          <p className="text-3xl font-bold text-green-600">
            {cows.filter(cow => cow.status === 'active').length}
          </p>
          <p className="text-gray-600 mt-2">En producción</p>
        </div>

        {/* Promedio de Producción */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Promedio por Vaca</h3>
          <p className="text-3xl font-bold text-purple-600">
            {(records.length && cows.length) 
              ? (records.reduce((sum, record) => sum + record.production_liters, 0) / cows.length).toFixed(2)
              : '0.00'} L
          </p>
          <p className="text-gray-600 mt-2">Litros por vaca</p>
        </div>
      </div>

      {/* Lista de Últimos Registros */}
      <div className="mt-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Últimos Registros</h3>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vaca
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producción (L)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sesión
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {records.slice(0, 5).map((record) => (
                <tr key={record._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {cows.find(cow => cow._id === record.cowId)?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {record.production_liters}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(record.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap capitalize">
                    {record.milking_session}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;