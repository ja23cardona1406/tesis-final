import React, { useState, useEffect } from 'react';
import { ThermometerIcon, DropletIcon, AlertTriangleIcon, CheckCircleIcon, CalendarIcon, MilkIcon, TimerIcon, CogIcon as CowIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Cow, DairyRecord } from '../../lib/types';
import { Percent } from "lucide-react";

// Extendemos la interfaz Cow para incluir los records como un arreglo opcional de DairyRecord
interface CowWithRecords extends Cow {
  records?: DairyRecord[];
}

interface RecommendationProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  priority: 'low' | 'medium' | 'high';
}

const FarmRecommendations: React.FC = () => {
  const [cows, setCows] = useState<CowWithRecords[]>([]);
  const [records, setRecords] = useState<DairyRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: cowsData, error: cowsError } = await supabase
          .from('cows')
          .select('*');

        if (cowsError) throw cowsError;
        setCows(cowsData as CowWithRecords[]);

        const { data: recordsData, error: recordsError } = await supabase
          .from('dairy_records')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1);

        if (recordsError) throw recordsError;
        setRecords(recordsData as DairyRecord[]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get active milking cows
  const activeMilkingCows = cows.filter(cow => cow.status === 'active' && cow.milking_status);
  
  // Calculate average production per cow
  const totalProduction = activeMilkingCows.reduce((total, cow) => total + cow.avg_production, 0);
  const avgProductionPerCow = activeMilkingCows.length > 0 ? totalProduction / activeMilkingCows.length : 0;

  const lastRecord = records.length > 0 ? records[0] : null;

  const getTemperatureRecommendation = (): RecommendationProps | null => {
    if (!lastRecord) return null;
    if (lastRecord.temperature > 28) {
      return {
        title: 'Alta Temperatura',
        description: 'Considere implementar sistemas de enfriamiento adicionales y asegure suficiente agua fresca. Las vacas pueden sufrir de estrés por calor, lo que reducirá la producción.',
        icon: <ThermometerIcon className="h-6 w-6 text-red-500" />,
        priority: 'high'
      };
    }
    if (lastRecord.temperature < 10) {
      return {
        title: 'Baja Temperatura',
        description: 'Proporcione refugio adecuado y considere aumentar la ración de alimento. Las vacas utilizarán más energía para mantener su temperatura corporal.',
        icon: <ThermometerIcon className="h-6 w-6 text-blue-500" />,
        priority: 'high'
      };
    }
    return {
      title: 'Temperatura Óptima',
      description: 'Las condiciones actuales de temperatura son favorables para la producción lechera.',
      icon: <ThermometerIcon className="h-6 w-6 text-green-500" />,
      priority: 'low'
    };
  };

  const getHumidityRecommendation = (): RecommendationProps | null => {
    if (!lastRecord) return null;
    if (lastRecord.udder_humidity > 80) {
      return {
        title: 'Alta Humedad',
        description: 'Mejore la ventilación y monitoree la salud de los animales. La alta humedad puede favorecer el crecimiento de patógenos y crear condiciones para mastitis.',
       icon: <Percent className="w-6 h-6 text-blue-600" />,
        priority: 'medium'
      };
    }
    if (lastRecord.udder_humidity < 40) {
      return {
        title: 'Baja Humedad',
        description: 'Considere sistemas de humidificación y asegure hidratación adecuada. La baja humedad puede causar problemas respiratorios y deshidratación.',
        icon:<Percent className="w-6 h-6 text-blue-600" />,
        priority: 'medium'
      };
    }
    return {
      title: 'Humedad Óptima',
      description: 'Las condiciones de humedad son adecuadas para el bienestar del ganado.',
      icon:<Percent className="w-6 h-6 text-blue-600" />,
      priority: 'low'
    };
  };

  const getProductionRecommendation = (): RecommendationProps | null => {
    if (activeMilkingCows.length === 0) return null;
    
    if (avgProductionPerCow < 7) {
      return {
        title: 'Producción Baja',
        description: 'El promedio de producción está por debajo del mínimo rentable de 7 litros por vaca. Revise la nutrición, salud y confort de los animales.',
        icon: <AlertTriangleIcon className="h-6 w-6 text-red-500" />,
        priority: 'high'
      };
    }
    if (avgProductionPerCow >= 15) {
      return {
        title: '¡Excelente Producción!',
        description: 'La producción está por encima de 15 litros por vaca, lo que indica un excelente manejo del rebaño. ¡Continúe con las buenas prácticas!',
        icon: <CheckCircleIcon className="h-6 w-6 text-green-500" />,
        priority: 'low'
      };
    }
    return {
      title: 'Producción Aceptable',
      description: 'El promedio de producción es rentable pero hay margen de mejora. Considere optimizar la alimentación y revisar el confort de los animales.',
      icon: <MilkIcon className="h-6 w-6 text-blue-500" />,
      priority: 'medium'
    };
  };

  const getLactationRecommendations = (): RecommendationProps[] => {
    const recommendations: RecommendationProps[] = [];
    
    // Find cows that need to be dried off soon (approaching 300 days)
    const cowsToSoonDryOff = cows.filter(
      cow => cow.status === 'active' && 
      cow.milking_status && 
      cow.lactation_days >= 270 && 
      cow.lactation_days < 300
    );
    
    // Find cows that should be dried off immediately (over 300 days)
    const cowsToDryOffNow = cows.filter(
      cow => cow.status === 'active' && 
      cow.milking_status && 
      cow.lactation_days >= 300
    );
    
    if (cowsToSoonDryOff.length > 0) {
      recommendations.push({
        title: 'Vacas Próximas a Secado',
        description: `${cowsToSoonDryOff.length} vacas están próximas a completar 300 días de lactancia. Prepare el proceso de secado para: ${cowsToSoonDryOff.map(cow => cow.name).join(', ')}.`,
        icon: <TimerIcon className="h-6 w-6 text-yellow-500" />,
        priority: 'medium'
      });
    }
    
    if (cowsToDryOffNow.length > 0) {
      recommendations.push({
        title: 'Vacas para Secado Inmediato',
        description: `${cowsToDryOffNow.length} vacas han superado los 300 días de lactancia y deben secarse inmediatamente: ${cowsToDryOffNow.map(cow => cow.name).join(', ')}.`,
        icon: <AlertTriangleIcon className="h-6 w-6 text-red-500" />,
        priority: 'high'
      });
    }
    
    return recommendations;
  };

  const getBreedingRecommendations = (): RecommendationProps | null => {
    // Find non-pregnant cows that should be bred (60 days postpartum)
    const cowsReadyForBreeding = cows.filter(
      cow => cow.status === 'active' && 
      cow.lactation_days >= 60 && 
      cow.lactation_days < 90 && 
      !cow.pregnant // Cambiado a !cow.pregnant para buscar vacas NO preñadas
    );
    
    if (cowsReadyForBreeding.length > 0) {
      return {
        title: 'Vacas Listas para Inseminación',
        description: `${cowsReadyForBreeding.length} vacas han superado los 60 días de lactancia y están en momento óptimo para inseminación: ${cowsReadyForBreeding.map(cow => cow.name).join(', ')}.`,
        icon: <CalendarIcon className="h-6 w-6 text-blue-500" />,
        priority: 'medium'
      };
    }
    
    return null;
  };

  const getHealthRecommendations = (): RecommendationProps | null => {
    // Analyze production drops as potential health issues
    const potentialHealthIssues = cows.filter(cow => {
      if (!cow.records || cow.records.length < 2) return false;
      
      // Sort records by date
      const sortedRecords = [...cow.records].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      // Check if there's a significant drop in production (more than 20%)
      const latestProduction = sortedRecords[0].production_liters;
      const previousProduction = sortedRecords[1].production_liters;
      
      return latestProduction < previousProduction * 0.8;
    });
    
    if (potentialHealthIssues.length > 0) {
      return {
        title: 'Posibles Problemas de Salud',
        description: `${potentialHealthIssues.length} vacas muestran una caída significativa en la producción, lo que podría indicar problemas de salud: ${potentialHealthIssues.map(cow => cow.name).join(', ')}.`,
        icon: <CowIcon className="h-6 w-6 text-red-500" />,
        priority: 'high'
      };
    }
    
    return null;
  };

  // Gather all recommendations
  const recommendations = [
    getTemperatureRecommendation(),
    getHumidityRecommendation(),
    getProductionRecommendation(),
    getBreedingRecommendations(),
    getHealthRecommendations(),
    ...getLactationRecommendations()
  ].filter((rec): rec is RecommendationProps => rec !== null);

  // Sort recommendations by priority (high first)
  const sortedRecommendations = [...recommendations].sort((a, b) => {
    const priorityValue = { high: 3, medium: 2, low: 1 };
    return priorityValue[b.priority] - priorityValue[a.priority];
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-2xl font-semibold mb-4">Recomendaciones</h3>
      {!lastRecord ? (
        <div className="bg-yellow-50 p-4 rounded-md">
          <p className="text-yellow-700">
            No hay datos suficientes para generar recomendaciones. Comience registrando datos de producción.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedRecommendations.map((rec, index) => (
            <div
              key={index}
              className={`bg-white p-6 rounded-lg shadow-md border-l-4 transition-all duration-300 hover:shadow-lg ${
                rec.priority === 'high' ? 'border-red-500 bg-red-50' :
                rec.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                'border-green-500 bg-green-50'
              }`}
            >
              <div className="flex items-center space-x-3 mb-4">
                {rec.icon}
                <h3 className={`text-xl font-semibold ${
                  rec.priority === 'high' ? 'text-red-700' :
                  rec.priority === 'medium' ? 'text-yellow-700' :
                  'text-green-700'
                }`}>
                  {rec.title}
                </h3>
              </div>
              <p className="text-gray-700">{rec.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FarmRecommendations;