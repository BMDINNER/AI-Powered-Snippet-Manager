import axios from 'axios';
import { config } from '../config/index.js';

interface GenerateRequest {
  prompt: string;
  system?: string;
  temperature?: number;
  maxTokens?: number;
}

export class AIService {
  private baseUrl: string;
  private model: string;

  constructor() {
    this.baseUrl = process.env.LLAMA_BASE_URL || 'http://localhost:8080';
    this.model = process.env.LLAMA_MODEL || 'llama3.2:3b-instruct-q4_K_M';
  }

  async generateCode(request: GenerateRequest): Promise<string> {
    try {
      const systemPrompt = request.system || 'You are a helpful code assistant. Generate clean, well-documented code snippets.';
      
      const response = await axios.post(`${this.baseUrl}/completion`, {
        prompt: request.prompt,
        system: systemPrompt,
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 500,
        stream: false,
        model: this.model
      });

      return response.data.content || response.data.response || response.data.text || '';
    } catch (error: any) {
      console.error('AI Service Error:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
      }
      
      if (error.code === 'ECONNREFUSED') {
        throw new Error('LLAMA server is not running. Please ensure llama.cpp server is started.');
      }
      
      throw new Error(`AI generation failed: ${error.message}`);
    }
  }

  async generateSnippet(title: string, description: string, language: string): Promise<string> {
    const prompt = `Generate a code snippet in ${language} for the following:
Title: ${title}
Description: ${description}

Provide only the code without any explanations or markdown formatting.`;

    return this.generateCode({ prompt, temperature: 0.8, maxTokens: 800 });
  }

  async improveSnippet(code: string, instructions: string): Promise<string> {
    const prompt = `Improve the following code based on these instructions:
Code:
${code}

Instructions: ${instructions}

Provide only the improved code without any explanations or markdown formatting.`;

    return this.generateCode({ prompt, temperature: 0.6, maxTokens: 800 });
  }

  async explainCode(code: string): Promise<string> {
    const prompt = `Explain the following code in simple terms, including its purpose, how it works, and any key concepts:
${code}

Provide a clear, concise explanation.`;

    return this.generateCode({ 
      prompt, 
      temperature: 0.5, 
      maxTokens: 500,
      system: 'You are a code explainer. Provide clear, beginner-friendly explanations of code.'
    });
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/health`);
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}

export default new AIService();