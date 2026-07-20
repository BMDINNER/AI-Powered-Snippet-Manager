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
      
      if (!result) {
        throw new Error('No response from AI service');
      }

      const codeData = result.data || result;
      
      if (!codeData.code) {
        throw new Error('AI returned empty code. Please try again with a different description.');
      }

      if (codeData.code.length === 0) {
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
      
      toast.success('Snippet generated successfully');
      return snippetData;
    } catch (err: any) {
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
      let rawCode = code;
      const codeBlockMatch = code.match(/```(?:\w+)?\n([\s\S]*?)```/);
      if (codeBlockMatch && codeBlockMatch[1]) {
        rawCode = codeBlockMatch[1].trim();
      }
      
      const result = await aiService.optimizeCode({ 
        code: rawCode, 
        language,
        instructions: 'Improve the code quality and readability without changing its purpose'
      });
      
      const optimizedData = result.data || result;
      
      if (!optimizedData || !optimizedData.optimizedCode) {
        throw new Error('AI returned empty optimized code');
      }
      
      const optimizedRaw = optimizedData.optimizedCode;
      
      toast.success('Code optimized successfully');
      return optimizedRaw;
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
      let rawCode = code;
      const codeBlockMatch = code.match(/```(?:\w+)?\n([\s\S]*?)```/);
      if (codeBlockMatch && codeBlockMatch[1]) {
        rawCode = codeBlockMatch[1].trim();
      }
      
      const result = await aiService.explainCode({ 
        code: rawCode, 
        language 
      });
      
      const explanationData = result.data || result;
      
      if (!explanationData || !explanationData.explanation) {
        throw new Error('AI returned empty explanation');
      }
      

      return explanationData.explanation;
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
      
      const chatData = result.data || result;
      
      if (!chatData || !chatData.response) {
        throw new Error('AI returned empty response');
      }
      
      return chatData.response;
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