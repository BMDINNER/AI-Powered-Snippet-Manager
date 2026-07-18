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
    const response = await api.post('/ai/generate', data) as AIGenerateResponse;
    console.log('aiService.generateSnippet response:', response);
    return response;
  },

  async optimizeCode(data: AIOptimizeRequest): Promise<AIOptimizeResponse> {
    console.log('aiService.optimizeCode called with:', data);
    const response = await api.post('/ai/improve', {
      code: data.code,
      instructions: data.instructions || 'Improve the code quality and readability',
      language: data.language
    }) as AIOptimizeResponse;
    console.log('aiService.optimizeCode response:', response);
    return response;
  },

  async explainCode(data: AIExplainRequest): Promise<AIExplainResponse> {
    console.log('aiService.explainCode called with:', data);
    const response = await api.post('/ai/explain', data) as AIExplainResponse;
    console.log('aiService.explainCode response:', response);
    return response;
  },

  async chat(data: AIChatRequest): Promise<AIChatResponse> {
    console.log('aiService.chat called with:', data);
    const response = await api.post('/ai/chat', data) as AIChatResponse;
    console.log('aiService.chat response:', response);
    return response;
  }
};