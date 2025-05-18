import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { getPublishedArticles } from "../lib/supabase";
import { LightbulbIcon, ThermometerIcon, DropletIcon, LeafIcon } from "lucide-react";
import FarmRecommendations from "../components/recommendations/FarmRecommendations";
import ArticlesList from "../components/articles/ArticlesList";
import { Article } from "../lib/types";
import { Percent } from "lucide-react";

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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Panel de Información</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-blue-100 rounded-md flex items-center space-x-3 transition-transform duration-300 hover:scale-105">
          <LightbulbIcon className="w-6 h-6 text-blue-600" />
          <span className="text-lg font-semibold">Innovación</span>
        </div>
        <div className="p-4 bg-red-100 rounded-md flex items-center space-x-3 transition-transform duration-300 hover:scale-105">
          <ThermometerIcon className="w-6 h-6 text-red-600" />
          <span className="text-lg font-semibold">Temperatura</span>
        </div>
        <div className="p-4 bg-green-100 rounded-md flex items-center space-x-3 transition-transform duration-300 hover:scale-105">
          <LeafIcon className="w-6 h-6 text-green-600" />
          <span className="text-lg font-semibold">Ecología</span>
        </div>
        <div className="p-4 bg-blue-100 rounded-md flex items-center space-x-3 transition-transform duration-300 hover:scale-105">
  <Percent className="w-6 h-6 text-blue-600" />
  <span className="text-lg font-semibold">Humedad ubre</span>
</div>
      </div>

      <div className="mb-8">
        <FarmRecommendations />
      </div>

      <div className="mt-8">
        <ArticlesList articles={articles} />
      </div>
    </div>
  );
};

export default Dashboard;