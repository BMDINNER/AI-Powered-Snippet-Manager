import api from './api';
import type { 
  AIGenerateRequest, 
  AIOptimizeRequest, 
  AIExplainRequest,
  AIChatRequest,
  AIGenerateResponse,
  AIOptimizeResponse,
  AIExplainResponse,
  AIChatResponse
} from '../types';

export const aiService = {
  async generateSnippet(data: AIGenerateRequest): Promise<AIGenerateResponse> {
    const response = await api.post('/ai/generate', data);
    
    if (!response || !response.data) {
      console.error('No data in response:', response);
      throw new Error('No data received from server');
    }
    return response.data;
  },

  async optimizeCode(data: AIOptimizeRequest): Promise<AIOptimizeResponse> {
    const response = await api.post('/ai/improve', data);
    return response.data;
  },

  async explainCode(data: AIExplainRequest): Promise<AIExplainResponse> {
    const response = await api.post('/ai/explain', data);
    return response.data;
  },

  async chat(data: AIChatRequest): Promise<AIChatResponse> {
    const response = await api.post('/ai/chat', data);
    return response.data;
  }
};