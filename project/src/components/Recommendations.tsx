import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { getPublishedArticles } from "../lib/supabase";
import { LightbulbIcon, ThermometerIcon, DropletIcon, LeafIcon } from "lucide-react";

// Definimos la interfaz para los artículos
interface Article {
  id: number;
  title: string;
  content: string;
}

const Dashboard = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const { records } = useSelector((state: RootState) => state.record);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const data = await getPublishedArticles();

        if (Array.isArray(data)) {
          const formattedData: Article[] = data.map((item: any) => ({
            id: item.id ?? 0,
            title: item.title ?? "Sin título",
            content: item.content ?? "Sin contenido disponible",
          }));
          setArticles(formattedData);
        } else {
          console.error("Formato inesperado en los datos de Supabase", data);
          setArticles([]);
        }
      } catch (error) {
        console.error("Error al obtener artículos:", error);
        setArticles([]);
      }
    };

    fetchArticles();
  }, []);

  // Obtener el último registro para análisis
  const lastRecord = records.length > 0 ? records[records.length - 1] : null;

  const getTemperatureRecommendation = () => {
    if (!lastRecord) return null;
    if (lastRecord.temperature > 28) {
      return {
        title: 'Alta Temperatura',
        description: 'Considere implementar sistemas de enfriamiento adicionales y asegure suficiente agua fresca.',
        icon: <ThermometerIcon className="h-6 w-6 text-red-500" />, priority: 'high'
      };
    }
    if (lastRecord.temperature < 10) {
      return {
        title: 'Baja Temperatura',
        description: 'Proporcione refugio adecuado y considere aumentar la ración de alimento.',
        icon: <ThermometerIcon className="h-6 w-6 text-blue-500" />, priority: 'high'
      };
    }
    return {
      title: 'Temperatura Óptima',
      description: 'Las condiciones actuales son favorables.',
      icon: <ThermometerIcon className="h-6 w-6 text-green-500" />, priority: 'low'
    };
  };

  const getHumidityRecommendation = () => {
    if (!lastRecord) return null;
    if (lastRecord.humidity > 80) {
      return {
        title: 'Alta Humedad',
        description: 'Mejore la ventilación y monitoree la salud de los animales.',
        icon: <DropletIcon className="h-6 w-6 text-blue-500" />, priority: 'medium'
      };
    }
    if (lastRecord.humidity < 40) {
      return {
        title: 'Baja Humedad',
        description: 'Considere sistemas de humidificación y asegure hidratación adecuada.',
        icon: <DropletIcon className="h-6 w-6 text-yellow-500" />, priority: 'medium'
      };
    }
    return {
      title: 'Humedad Óptima',
      description: 'Las condiciones de humedad son adecuadas.',
      icon: <DropletIcon className="h-6 w-6 text-green-500" />, priority: 'low'
    };
  };

  const recommendations = [
    getTemperatureRecommendation(),
    getHumidityRecommendation()
  ].filter((rec): rec is NonNullable<typeof rec> => rec !== null);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Panel de Información</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-blue-100 rounded-md flex items-center space-x-3">
          <LightbulbIcon className="w-6 h-6 text-blue-600" />
          <span className="text-lg font-semibold">Innovación</span>
        </div>
        <div className="p-4 bg-red-100 rounded-md flex items-center space-x-3">
          <ThermometerIcon className="w-6 h-6 text-red-600" />
          <span className="text-lg font-semibold">Temperatura</span>
        </div>
        <div className="p-4 bg-green-100 rounded-md flex items-center space-x-3">
          <LeafIcon className="w-6 h-6 text-green-600" />
          <span className="text-lg font-semibold">Ecología</span>
        </div>
        <div className="p-4 bg-blue-100 rounded-md flex items-center space-x-3">
          <DropletIcon className="w-6 h-6 text-blue-600" />
          <span className="text-lg font-semibold">Humedad</span>
        </div>
      </div>

      <h3 className="text-2xl font-semibold mb-4">Recomendaciones</h3>
      {!lastRecord ? (
        <div className="bg-yellow-50 p-4 rounded-md">
        <p className="text-yellow-700">
          No hay datos suficientes para generar recomendaciones. Comience registrando datos de producción.
        </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {recommendations.map((rec, index) => (
            <div key={index} className={`bg-white p-6 rounded-lg shadow-md border-l-4 ${
              rec.priority === 'high' ? 'border-red-500' : rec.priority === 'medium' ? 'border-yellow-500' : 'border-green-500'
            }`}>
              <div className="flex items-center space-x-3 mb-4">{rec.icon}
                <h3 className="text-xl font-semibold">{rec.title}</h3>
              </div>
              <p className="text-gray-600">{rec.description}</p>
            </div>
          ))}
        </div>
      )}

      <h3 className="text-2xl font-semibold mb-4 mt-8">Artículos Recomendados</h3>
      {articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <div key={article.id} className="p-4 bg-gray-100 rounded-md shadow-md">
              <h4 className="text-xl font-bold">{article.title}</h4>
              <p className="text-gray-700">{article.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No hay artículos disponibles en este momento.</p>
      )}
    </div>
  );
};

export default Dashboard;
