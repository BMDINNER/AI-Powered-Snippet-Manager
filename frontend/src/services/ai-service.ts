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
    return response as unknown as AIGenerateResponse;
  },

  async optimizeCode(data: AIOptimizeRequest): Promise<AIOptimizeResponse> {
    const response = await api.post('/ai/improve', {
      code: data.code,
      instructions: data.instructions || 'Improve the code quality and readability',
      language: data.language
    });
    const responseData = response as any;
    return responseData.data || responseData;
  },

  async explainCode(data: AIExplainRequest): Promise<AIExplainResponse> {
    const response = await api.post('/ai/explain', data);
    return response as unknown as AIExplainResponse;
  },

  async chat(data: AIChatRequest): Promise<AIChatResponse> {
    const response = await api.post('/ai/chat', data);
    return response as unknown as AIChatResponse;
  }
};