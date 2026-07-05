import axios from 'axios';
import {
  OllamaGenerateRequest,
  OllamaGenerateResponse,
  OllamaChatRequest,
  OllamaChatResponse,
  OllamaChatMessage
} from '../types/ollama-types';

export class OllamaService {
  private baseUrl: string;
  private timeout: number;
  private model: string;

  constructor() {
    this.baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    this.timeout = parseInt(process.env.OLLAMA_TIMEOUT || '120000');
    this.model = process.env.OLLAMA_MODEL || 'tinyllama';
  }

  async generateCode(prompt: string, language: string): Promise<string> {
    const fullPrompt = `Generate ${language} code for: ${prompt}. Return only the code without any explanations.`;

    try {
      const request: OllamaGenerateRequest = {
        model: this.model,
        prompt: fullPrompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          num_predict: 4096,
        },
      };

      const response = await axios.post<OllamaGenerateResponse>(
        `${this.baseUrl}/api/generate`,
        request,
        { timeout: this.timeout }
      );

      if (!response.data.response) {
        throw new Error('Empty response from Ollama');
      }

      return response.data.response;
    } catch (error: any) {
      console.error('Ollama generateCode error:', error.message);
      if (error.code === 'ECONNABORTED') {
        throw new Error(`Code generation timed out after ${this.timeout / 1000} seconds`);
      }
      throw new Error(`Failed to generate code: ${error.message}`);
    }
  }

  async explainCode(code: string, language: string): Promise<string> {
    const prompt = `Explain this ${language} code in detail. Describe what it does, how it works, and any important details:\n\n${code}`;

    try {
      const request: OllamaGenerateRequest = {
        model: this.model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.5,
          num_predict: 2048,
        },
      };

      const response = await axios.post<OllamaGenerateResponse>(
        `${this.baseUrl}/api/generate`,
        request,
        { timeout: this.timeout }
      );

      return response.data.response;
    } catch (error: any) {
      console.error('Ollama explainCode error:', error.message);
      throw new Error(`Failed to explain code: ${error.message}`);
    }
  }

  async optimizeCode(code: string, language: string): Promise<string> {
    const prompt = `Optimize this ${language} code for better performance, readability, and best practices. Return only the optimized code:\n\n${code}`;

    try {
      const request: OllamaGenerateRequest = {
        model: this.model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.3,
          num_predict: 4096,
        },
      };

      const response = await axios.post<OllamaGenerateResponse>(
        `${this.baseUrl}/api/generate`,
        request,
        { timeout: this.timeout }
      );

      return response.data.response;
    } catch (error: any) {
      console.error('Ollama optimizeCode error:', error.message);
      throw new Error(`Failed to optimize code: ${error.message}`);
    }
  }

  async chat(messages: OllamaChatMessage[]): Promise<string> {
  try {
    const request: OllamaChatRequest = {
      model: this.model,
      messages: messages,
      stream: false,
      options: {
        temperature: 0.7,
        num_predict: 4096,
      },
    };

    const response = await axios.post<OllamaChatResponse>(
      `${this.baseUrl}/api/chat`,
      request,
      { timeout: this.timeout }
    );

    console.log('Ollama chat response received');

    if (response.data.message && response.data.message.content) {
      return response.data.message.content;
    }

    throw new Error('Invalid response format from Ollama');
  } catch (error: any) {
    console.error('Ollama chat error:', {
      message: error.message,
      response: error.response?.data
    });
    throw new Error(`Failed to chat with AI: ${error.message}`);
  }
}

  async checkHealth(): Promise<{ available: boolean; models?: string[] }> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`, { timeout: 5000 });
      const models = response.data.models?.map((m: any) => m.name) || [];
      return { available: true, models };
    } catch (error) {
      return { available: false };
    }
  }
}

export const ollamaService = new OllamaService();