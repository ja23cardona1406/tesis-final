import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { User } from '../../lib/types';

interface ArticleCommentProps {
  id: string;
  content: string;
  user: User | null;
  createdAt: string;
}

const ArticleComment: React.FC<ArticleCommentProps> = ({ 
  content, 
  user, 
  createdAt 
}) => {
  const formattedDate = formatDistanceToNow(new Date(createdAt), { 
    addSuffix: true,
    locale: es
  });

  // Generate a user avatar placeholder based on the first letter of the email
  const userInitial = user?.email ? user.email[0].toUpperCase() : '?';
  
  return (
    <div className="flex space-x-4 p-4 border-b border-gray-100 transition-colors duration-200 hover:bg-gray-50">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold">
          {userInitial}
        </div>
      </div>
      <div className="flex-1">
        <div className="flex items-center mb-1">
          <span className="font-medium text-gray-900">
            {user?.email || 'Usuario anónimo'}
          </span>
          <span className="mx-2 text-gray-300">•</span>
          <span className="text-sm text-gray-500">{formattedDate}</span>
        </div>
        <p className="text-gray-700">{content}</p>
      </div>
    </div>
  );
};

export default ArticleComment;