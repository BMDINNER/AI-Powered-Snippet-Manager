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
      const result = await aiService.generateSnippet({ prompt, language });
      
      console.log('Full result from aiService:', result);
      
      // Check if result exists and has the expected structure
      if (!result) {
        console.error('Result is null or undefined');
        throw new Error('No response from AI service');
      }

      // The result might be wrapped in a data property
      const codeData = result.data || result;
      
      console.log('Extracted code data:', codeData);
      
      if (!codeData.code) {
        console.error('No code found in response:', codeData);
        throw new Error('AI returned empty code. Please try again with a different description.');
      }

      if (codeData.code.length === 0) {
        console.error('Empty code string:', codeData);
        throw new Error('AI returned empty code. Please try again with a different description.');
      }
      
      const snippetData: CreateSnippetInput = {
        title: codeData.title || prompt.split(' ').slice(0, 5).join(' ') + '...',
        description: codeData.description || prompt,
        code: codeData.code,
        language: codeData.language || language,
        tags: Array.isArray(codeData.tags) ? codeData.tags : [],
        aiGenerated: true,
        userId: ''
      };
      
      console.log('Final snippet data:', snippetData);
      
      toast.success('Snippet generated successfully');
      return snippetData;
    } catch (err: any) {
      console.error('Generate snippet error:', err);
      const message = err.response?.data?.message || err.message || 'Failed to generate snippet';
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
      const result = await aiService.optimizeCode({ 
        code, 
        language,
        instructions: 'Improve the code quality and readability'
      });
      
      console.log('Optimize result:', result);
      
      const optimizedData = result.data || result;
      
      if (!optimizedData || !optimizedData.optimizedCode) {
        throw new Error('AI returned empty optimized code');
      }
      
      toast.success('Code optimized successfully');
      return optimizedData.optimizedCode;
    } catch (err: any) {
      console.error('Optimize error:', err);
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
      
      console.log('Explain result:', result);
      
      const explanationData = result.data || result;
      
      if (!explanationData || !explanationData.explanation) {
        throw new Error('AI returned empty explanation');
      }
      
      return explanationData.explanation;
    } catch (err: any) {
      console.error('Explain error:', err);
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
      
      console.log('Chat result:', result);
      
      const chatData = result.data || result;
      
      if (!chatData || !chatData.response) {
        throw new Error('AI returned empty response');
      }
      
      return chatData.response;
    } catch (err: any) {
      console.error('Chat error:', err);
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