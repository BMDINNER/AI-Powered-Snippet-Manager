import api from './api';
import type { Snippet, SnippetQuery, PaginatedResponse } from '../types';

export const snippetService = {
  async createSnippet(data: any): Promise<Snippet> {
    console.log('snippetService.createSnippet called with:', data);
    const response = await api.post('/snippets', data);
    console.log('snippetService.createSnippet response:', response);
    const snippetData = (response as any).data;
    console.log('Extracted snippet data:', snippetData);
    console.log('Code length in response:', snippetData?.code?.length);
    return snippetData;
  },

  async getSnippets(query?: SnippetQuery): Promise<PaginatedResponse<Snippet>> {
    const params = new URLSearchParams();
    if (query?.search) params.append('search', query.search);
    if (query?.language) params.append('language', query.language);
    if (query?.tags && query.tags.length > 0) {
      params.append('tags', query.tags.join(','));
    }
    if (query?.page) params.append('page', query.page.toString());
    if (query?.limit) params.append('limit', query.limit.toString());
    
    const queryString = params.toString();
    console.log('snippetService.getSnippets URL:', `/snippets?${queryString}`);
    
    const response = await api.get(`/snippets?${queryString}`);
    const apiResponse = response as any;
    
    console.log('snippetService.getSnippets raw response:', apiResponse);
    console.log('Data array length:', apiResponse.data?.length);
    
    return {
      snippets: apiResponse.data || [],
      total: apiResponse.meta?.total || 0,
      page: apiResponse.meta?.page || 1,
      limit: apiResponse.meta?.limit || 10,
      pages: apiResponse.meta?.pages || 0
    };
  },

  async getSnippet(id: string): Promise<Snippet> {
    console.log('snippetService.getSnippet called with id:', id);
    const response = await api.get(`/snippets/${id}`);
    const snippetData = (response as any).data;
    console.log('snippetService.getSnippet response:', snippetData);
    console.log('Code in retrieved snippet:', snippetData?.code?.length);
    return snippetData;
  },

  async updateSnippet(id: string, data: any): Promise<Snippet> {
    console.log('snippetService.updateSnippet called with id:', id, data);
    const response = await api.put(`/snippets/${id}`, data);
    return (response as any).data as Snippet;
  },

  async deleteSnippet(id: string): Promise<void> {
    console.log('snippetService.deleteSnippet called with id:', id);
    const response = await api.delete(`/snippets/${id}`);
    return response as unknown as void;
  },

  async getLanguages(): Promise<string[]> {
    const response = await api.get('/snippets/languages');
    return (response as any).data as string[];
  },

  async getTags(): Promise<string[]> {
    const response = await api.get('/snippets/tags');
    return (response as any).data as string[];
  },

  async getCategories(): Promise<string[]> {
    const response = await api.get('/snippets/categories');
    return (response as any).data as string[];
  }
};