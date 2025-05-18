import React, { useState } from 'react';
import { Book } from 'lucide-react';
import ArticleDetail from './ArticleDetail';

interface Article {
  id: string;
  title: string;
  content: string;
}

interface ArticlesListProps {
  articles: Article[];
}

const ArticlesList: React.FC<ArticlesListProps> = ({ articles }) => {
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);

  return (
    <div>
      <h3 className="text-2xl font-semibold mb-4 flex items-center">
        <Book className="h-6 w-6 mr-2 text-indigo-600" />
        Artículos Recomendados
      </h3>
      
      {selectedArticle ? (
        <ArticleDetail 
          articleId={selectedArticle} 
          onClose={() => setSelectedArticle(null)} 
        />
      ) : articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <div 
              key={article.id} 
              className="p-5 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
              onClick={() => setSelectedArticle(article.id)}
            >
              <h4 className="text-xl font-bold text-gray-900 mb-2">{article.title}</h4>
              <p className="text-gray-700 line-clamp-3">
                {article.content}
              </p>
              <button 
                className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedArticle(article.id);
                }}
              >
                Leer más
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No hay artículos disponibles en este momento.</p>
      )}
    </div>
  );
};

export default ArticlesList;