import Groq from 'groq-sdk';
import { config } from '../config/index.js';

interface GenerateRequest {
  prompt: string;
  system?: string;
  temperature?: number;
  maxTokens?: number;
}

export class AIService {
  private groq: Groq;
  private model: string;

  constructor() {
    this.groq = new Groq({ apiKey: config.groqApiKey });
    this.model = config.groqModel;
  }

  async generateCode(request: GenerateRequest): Promise<string> {
    try {
      const systemPrompt = request.system || 'You are a helpful code assistant. Generate clean, well-documented code snippets.';
      
      const response = await this.groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: request.prompt }
        ],
        model: this.model,
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 500,
      });

      return response.choices[0]?.message?.content || '';
    } catch (error: any) {
      console.error('AI Service Error:', error.message);
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
      await this.groq.chat.completions.create({
        messages: [{ role: 'user', content: 'test' }],
        model: this.model,
        max_tokens: 1,
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default new AIService();