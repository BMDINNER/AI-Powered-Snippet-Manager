import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSnippets } from '../../hooks/useSnippets';
import { useAI } from '../../hooks/useAI';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { MarkdownRenderer } from '../ui/MarkdownRenderer';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faCopy, 
  faEdit, 
  faTrash, 
  faMagic,
  faRobot,
  faComment,
  faClock,
  faCode,
  faTag
} from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
import type { Snippet } from '../../types';

export const SnippetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSnippet, deleteSnippet, updateSnippet, loading: snippetsLoading } = useSnippets();
  const { explainCode, optimizeCode, loading: aiLoading } = useAI();
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadSnippet();
    }
  }, [id]);

  const loadSnippet = async () => {
    try {
      const data = await getSnippet(id!);
      setSnippet(data);
      if (data.aiExplanation) {
        setExplanation(data.aiExplanation);
        setShowExplanation(true);
      }
    } catch (error) {
      console.error('Failed to load snippet:', error);
      toast.error('Failed to load snippet');
      navigate('/snippets');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (snippet?.code) {
      navigator.clipboard.writeText(snippet.code);
      toast.success('Code copied to clipboard');
    }
  };

  const handleEdit = () => {
    navigate(`/snippets/${id}/edit`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this snippet?')) {
      try {
        await deleteSnippet(id!);
        toast.success('Snippet deleted');
        navigate('/snippets');
      } catch (error) {
        toast.error('Failed to delete snippet');
      }
    }
  };

  const handleExplain = async () => {
    if (!snippet?.code) {
      toast.error('No code to explain');
      return;
    }
    
    try {
      const result = await explainCode(snippet.code, snippet.language);
      setExplanation(result);
      setShowExplanation(true);
      
      await updateSnippet(snippet.id, {
        ...snippet,
        aiExplanation: result
      });
      
      toast.success('Explanation generated and saved');
    } catch (error) {
      toast.error('Failed to explain code');
    }
  };

  const handleOptimize = async () => {
    if (!snippet?.code) {
      toast.error('No code to optimize');
      return;
    }
    
    try {
      const optimized = await optimizeCode(snippet.code, snippet.language);
      const updatedSnippet = { ...snippet, code: optimized };
      setSnippet(updatedSnippet);
      await updateSnippet(snippet.id, updatedSnippet);
      toast.success('Code optimized');
    } catch (error) {
      toast.error('Failed to optimize code');
    }
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Invalid date';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading || snippetsLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!snippet) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Snippet not found</p>
        <Button onClick={() => navigate('/snippets')} className="mt-4">
          Back to Snippets
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/snippets')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
          <span>Back to Snippets</span>
        </button>
        
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleCopy}>
            <FontAwesomeIcon icon={faCopy} className="h-4 w-4 mr-2" />
            Copy
          </Button>
          <Button size="sm" variant="outline" onClick={handleEdit}>
            <FontAwesomeIcon icon={faEdit} className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button size="sm" variant="danger" onClick={handleDelete}>
            <FontAwesomeIcon icon={faTrash} className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{snippet.title}</h1>
            {snippet.description && (
              <p className="text-gray-600 mt-2">{snippet.description}</p>
            )}
          </div>
          
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <FontAwesomeIcon icon={faCode} className="h-4 w-4" />
              {snippet.language}
            </span>
            <span className="flex items-center gap-1">
              <FontAwesomeIcon icon={faClock} className="h-4 w-4" />
              Created: {formatDate(snippet.createdAt)}
            </span>
            {snippet.aiGenerated && (
              <span className="flex items-center gap-1 text-gray-700">
                <FontAwesomeIcon icon={faRobot} className="h-4 w-4" />
                AI Generated
              </span>
            )}
          </div>

          {snippet.tags && snippet.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <FontAwesomeIcon icon={faTag} className="h-4 w-4 text-gray-400 mt-1" />
              {snippet.tags.map((tag: string) => (
                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Code</h2>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleExplain} loading={aiLoading}>
              <FontAwesomeIcon icon={faComment} className="h-4 w-4 mr-2" />
              Explain
            </Button>
            <Button size="sm" variant="outline" onClick={handleOptimize} loading={aiLoading}>
              <FontAwesomeIcon icon={faMagic} className="h-4 w-4 mr-2" />
              Optimize
            </Button>
          </div>
        </div>
        
        {snippet.code ? (
          <div className="bg-[#282c34] rounded-lg p-4 overflow-x-auto">
            <MarkdownRenderer content={snippet.code} isCode={true} />
          </div>
        ) : (
          <div className="p-4 rounded-lg text-center border border-gray-200">
            No code available
          </div>
        )}
      </Card>

      {showExplanation && explanation && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Explanation</h2>
            <Button size="sm" variant="ghost" onClick={() => setShowExplanation(false)}>
              Close
            </Button>
          </div>
          <div className="prose prose-sm max-w-none text-gray-700 bg-gray-50 p-4 rounded-lg">
            <MarkdownRenderer content={explanation} />
          </div>
        </Card>
      )}
    </div>
  );
};