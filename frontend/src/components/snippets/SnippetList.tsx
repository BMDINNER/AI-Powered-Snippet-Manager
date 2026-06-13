import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSnippets } from '../../hooks/useSnippets';
import { useDebounce } from '../../hooks/useDebounce';
import { SnippetItem } from './SnippetItem';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { faSearch, faPlus, faCode, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const languageOptions = [
  { value: '', label: 'All Languages' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'sql', label: 'SQL' },
  { value: 'bash', label: 'Bash' },
  { value: 'json', label: 'JSON' }
];

export const SnippetList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { snippets, loading, pagination, fetchSnippets } = useSnippets();
  const [searchTerm, setSearchTerm] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    const tagParam = searchParams.get('tag');
    if (tagParam && !selectedTags.includes(tagParam)) {
      setSelectedTags([tagParam]);
    }
  }, [searchParams]);

  useEffect(() => {
    console.log('Fetching snippets with filters:', {
      search: debouncedSearch,
      language: languageFilter,
      tags: selectedTags
    });
    
    fetchSnippets({
      search: debouncedSearch || undefined,
      language: languageFilter || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      page: 1,
      limit: 12
    });
  }, [debouncedSearch, languageFilter, selectedTags]);

  const handlePageChange = (newPage: number) => {
    fetchSnippets({
      search: debouncedSearch || undefined,
      language: languageFilter || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      page: newPage,
      limit: 12
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguageFilter(e.target.value);
  };

  const handleTagClick = (tag: string) => {
    console.log('Tag clicked:', tag);
    if (!selectedTags.includes(tag)) {
      const newTags = [...selectedTags, tag];
      setSelectedTags(newTags);
      setSearchParams({ tag: newTags.join(',') });
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = selectedTags.filter(tag => tag !== tagToRemove);
    setSelectedTags(newTags);
    if (newTags.length === 0) {
      searchParams.delete('tag');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ tag: newTags.join(',') });
    }
  };

  const clearAllTags = () => {
    setSelectedTags([]);
    searchParams.delete('tag');
    setSearchParams(searchParams);
  };

  const handleNewSnippet = () => {
    navigate('/snippets/new');
  };

  if (loading && snippets.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-500 rounded-xl flex items-center justify-center">
            <FontAwesomeIcon icon={faCode} className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">My Snippets</h1>
        </div>
        <Button 
          icon={faPlus} 
          onClick={handleNewSnippet}
          size="md"
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          Create New Snippet
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search snippets by title, description, or code..."
            value={searchTerm}
            onChange={handleSearchChange}
            icon={faSearch}
            className="bg-white border-gray-300 focus:border-red-500 focus:ring-red-500"
          />
        </div>
        <div className="w-full sm:w-48">
          <select
            value={languageFilter}
            onChange={handleLanguageChange}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
          >
            {languageOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 rounded-lg">
          <span className="text-sm text-gray-600">Filtering by tags:</span>
          {selectedTags.map(tag => (
            <span
              key={tag}
              className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full flex items-center gap-1"
            >
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="hover:text-red-900"
              >
                <FontAwesomeIcon icon={faTimes} className="h-2 w-2" />
              </button>
            </span>
          ))}
          <button
            onClick={clearAllTags}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Clear all
          </button>
        </div>
      )}

      {snippets.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FontAwesomeIcon icon={faCode} className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500 mb-4">No snippets found</p>
          <Button 
            onClick={handleNewSnippet} 
            variant="primary"
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Create your first snippet
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {snippets.map((snippet) => (
              <SnippetItem 
                key={snippet.id} 
                snippet={snippet} 
                onTagClick={handleTagClick}
              />
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className="flex justify-center items-center space-x-2 pt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => handlePageChange(pagination.page - 1)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Previous
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  let pageNum: number;
                  const total = pagination.pages;
                  const current = pagination.page;
                  
                  if (total <= 5) {
                    pageNum = i + 1;
                  } else if (current <= 3) {
                    pageNum = i + 1;
                  } else if (current >= total - 2) {
                    pageNum = total - 4 + i;
                  } else {
                    pageNum = current - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`
                        w-8 h-8 rounded-lg text-sm font-medium transition-colors
                        ${pagination.page === pageNum
                          ? 'bg-red-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === pagination.pages}
                onClick={() => handlePageChange(pagination.page + 1)}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Next
              </Button>
            </div>
          )}

          <div className="text-center text-sm text-gray-500">
            Showing {snippets.length} of {pagination.total} snippets
          </div>
        </>
      )}
    </div>
  );
};