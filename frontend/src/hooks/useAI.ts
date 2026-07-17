import { useState, useCallback } from 'react';
import { aiService } from '../services/ai-service';
import type { AIMessage, CreateSnippetInput } from '../types';
import toast from 'react-hot-toast';

export const useAI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSnippet = useCallback(async (prompt: string, language: string): Promise<CreateSnippetInput> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('useAI.generateSnippet called with:', { prompt, language });
      
      const result = await aiService.generateSnippet({ prompt, language });
      
      console.log('useAI.generateSnippet result:', result);
      console.log('Result code:', result.code);
      console.log('Result title:', result.title);
      console.log('Result tags:', result.tags);
      
      const snippetData = {
        title: result.title || prompt.split(' ').slice(0, 5).join(' ') + '...',
        description: result.description || prompt,
        code: result.code || '',
        language: result.language || language,
        tags: Array.isArray(result.tags) ? result.tags : [],
        aiGenerated: true,
        userId: ''
      };
      
      console.log('Returning snippet data:', snippetData);
      
      toast.success('Snippet generated successfully');
      return snippetData;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to generate snippet';
      console.error('useAI.generateSnippet error:', err);
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const optimizeCode = useCallback(async (code: string, language: string): Promise<string> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await aiService.optimizeCode({ code, language });
      toast.success('Code optimized successfully');
      return result.optimizedCode;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to optimize code';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const explainCode = useCallback(async (code: string, language: string): Promise<string> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await aiService.explainCode({ code, language });
      return result.explanation;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to explain code';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const chat = useCallback(async (messages: AIMessage[]): Promise<string> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await aiService.chat({ messages });
      return result.response;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to chat with AI';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    generateSnippet,
    optimizeCode,
    explainCode,
    chat
  };
};