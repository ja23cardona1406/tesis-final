import React, { useState, useEffect } from 'react';
import { supabase, getCurrentUser, getUserById } from '../../lib/supabase';
import ArticleComment from './ArticleComment';
import CommentForm from './CommentForm';
import { User, Article, Comment } from '../../lib/types';

interface ArticleDetailProps {
  articleId: string;
  onClose?: () => void;
}

const ArticleDetail: React.FC<ArticleDetailProps> = ({ articleId, onClose }) => {
  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchArticleAndComments = async () => {
      setLoading(true);
      try {
        // Get current user
        const user = await getCurrentUser();
        setCurrentUser(user ? { 
          id: user.id, 
          email: user.email || undefined 
        } : null);

        // Get article
        const { data: articleData, error: articleError } = await supabase
          .from('articles')
          .select('*')
          .eq('id', articleId)
          .single();

        if (articleError) throw new Error(articleError.message);
        setArticle(articleData as Article);

        // Get comments
        const { data: commentsData, error: commentsError } = await supabase
          .from('comments')
          .select('*')
          .eq('article_id', articleId)
          .order('created_at', { ascending: false });

        if (commentsError) throw new Error(commentsError.message);
        
        // Process comments and fetch user info for each
        const processedComments = await Promise.all((commentsData || []).map(async (comment) => {
          const userInfo = await getUserById(comment.user_id);
          return {
            id: comment.id,
            article_id: comment.article_id,
            user_id: comment.user_id,
            content: comment.content,
            created_at: comment.created_at,
            user: userInfo
          };
        }));

        setComments(processedComments);
      } catch (err) {
        console.error('Error fetching article details:', err);
        setError('Error al cargar el artículo y comentarios');
      } finally {
        setLoading(false);
      }
    };

    fetchArticleAndComments();
  }, [articleId]);

  const handleCommentAdded = async () => {
    try {
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('article_id', articleId)
        .order('created_at', { ascending: false });

      if (commentsError) throw new Error(commentsError.message);
      
      const processedComments = await Promise.all((commentsData || []).map(async (comment) => {
        const userInfo = await getUserById(comment.user_id);
        return {
          id: comment.id,
          article_id: comment.article_id,
          user_id: comment.user_id,
          content: comment.content,
          created_at: comment.created_at,
          user: userInfo
        };
      }));

      setComments(processedComments);
    } catch (err) {
      console.error('Error refreshing comments:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        {error || 'No se pudo cargar el artículo'}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-gray-900">{article.title}</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="prose max-w-none mb-8">
          <p className="text-gray-700 whitespace-pre-line">{article.content}</p>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold mb-4">Comentarios ({comments.length})</h3>
          
          {currentUser ? (
            <CommentForm 
              articleId={articleId} 
              userId={currentUser.id} 
              onCommentAdded={handleCommentAdded} 
            />
          ) : (
            <div className="bg-yellow-50 p-3 rounded-md text-sm text-yellow-700 mb-4">
              Inicia sesión para dejar un comentario
            </div>
          )}

          <div className="mt-6 space-y-1">
            {comments.length > 0 ? (
              comments.map(comment => (
                <ArticleComment 
                  key={comment.id}
                  id={comment.id}
                  content={comment.content}
                  user={comment.user}
                  createdAt={comment.created_at}
                />
              ))
            ) : (
              <p className="text-gray-500 italic">No hay comentarios aún. ¡Sé el primero en comentar!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;