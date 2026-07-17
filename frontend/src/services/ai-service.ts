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
    console.log('aiService.generateSnippet called with:', data);
    const response = await api.post('/ai/generate', data);
    console.log('aiService.generateSnippet response:', response);
    
    if (!response || !response.data) {
      console.error('No data in response:', response);
      throw new Error('No data received from server');
    }
    
    console.log('Response data code length:', response.data.code?.length || 0);
    return response.data;
  },

  async optimizeCode(data: AIOptimizeRequest): Promise<AIOptimizeResponse> {
    console.log('aiService.optimizeCode called with:', data);
    const response = await api.post('/ai/improve', data);
    console.log('aiService.optimizeCode response:', response);
    return response.data;
  },

  async explainCode(data: AIExplainRequest): Promise<AIExplainResponse> {
    console.log('aiService.explainCode called with:', data);
    const response = await api.post('/ai/explain', data);
    console.log('aiService.explainCode response:', response);
    return response.data;
  },

  async chat(data: AIChatRequest): Promise<AIChatResponse> {
    console.log('aiService.chat called with:', data);
    const response = await api.post('/ai/chat', data);
    console.log('aiService.chat response:', response);
    return response.data;
  }
};