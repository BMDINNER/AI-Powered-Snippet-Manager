import { useState, useCallback } from 'react';
import { snippetService } from '../services/snippet-service';
import type { Snippet, SnippetQuery } from '../types';
import toast from 'react-hot-toast';

export const useSnippets = () => {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  const fetchSnippets = useCallback(async (query?: SnippetQuery) => {
    setLoading(true);
    try {
      const response = await snippetService.getSnippets(query);
      setSnippets(response.snippets);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        pages: response.pages
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch snippets');
    } finally {
      setLoading(false);
    }
  }, []);

  const getSnippet = useCallback(async (id: string): Promise<Snippet> => {
    setLoading(true);
    try {
      const snippet = await snippetService.getSnippet(id);
      return snippet;
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch snippet');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const createSnippet = useCallback(async (data: any) => {
    setLoading(true);
    try {
      const snippet = await snippetService.createSnippet(data);
      toast.success('Snippet created successfully');
      return snippet;
    } catch (error: any) {
      toast.error(error.message || 'Failed to create snippet');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSnippet = useCallback(async (id: string, data: any) => {
    setLoading(true);
    try {
      const snippet = await snippetService.updateSnippet(id, data);
      toast.success('Snippet updated successfully');
      return snippet;
    } catch (error: any) {
      toast.error(error.message || 'Failed to update snippet');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteSnippet = useCallback(async (id: string) => {
    setLoading(true);
    try {
      await snippetService.deleteSnippet(id);
      toast.success('Snippet deleted successfully');
      await fetchSnippets();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete snippet');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchSnippets]);

  return {
    snippets,
    loading,
    pagination,
    fetchSnippets,
    getSnippet,
    createSnippet,
    updateSnippet,
    deleteSnippet
  };
};