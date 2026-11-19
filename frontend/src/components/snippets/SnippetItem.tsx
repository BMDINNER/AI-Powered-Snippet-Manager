import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCode, faTag, faClock, faRobot } from '@fortawesome/free-solid-svg-icons';
import type { Snippet } from '../../types';

interface SnippetItemProps {
  snippet: Snippet;
  onTagClick?: (tag: string) => void;
}

export const SnippetItem: React.FC<SnippetItemProps> = ({ snippet, onTagClick }) => {
  const navigate = useNavigate();

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Just now';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Just now';
    
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const handleTagClick = (e: React.MouseEvent, tag: string) => {
    e.stopPropagation();
    if (onTagClick) {
      onTagClick(tag);
    }
  };

  return (
    <div 
      onClick={() => navigate(`/snippets/${snippet.id}`)}
      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900 text-lg line-clamp-1">
          {snippet.title}
        </h3>
        {snippet.aiGenerated && (
          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full flex items-center gap-1">
            <FontAwesomeIcon icon={faRobot} className="h-3 w-3" />
            AI
          </span>
        )}
      </div>
      
      {snippet.description && (
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {snippet.description}
        </p>
      )}
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <FontAwesomeIcon icon={faCode} className="h-3 w-3" />
          {snippet.language}
        </span>
        <span className="flex items-center gap-1">
          <FontAwesomeIcon icon={faClock} className="h-3 w-3" />
          {formatDate(snippet.createdAt)}
        </span>
      </div>
      
      {snippet.tags && snippet.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          <FontAwesomeIcon icon={faTag} className="h-3 w-3 text-gray-400 mt-1 mr-1" />
          {snippet.tags.slice(0, 3).map(tag => (
            <button
              key={tag}
              onClick={(e) => handleTagClick(e, tag)}
              className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full flex items-center gap-1 hover:bg-gray-200 hover:text-gray-800 transition-colors cursor-pointer"
            >
              {tag}
            </button>
          ))}
          {snippet.tags.length > 3 && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
              +{snippet.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
};