import Groq from 'groq-sdk';
import { config } from '../config/index.js';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class GroqService {
  private groq: Groq;
  private model: string;

  constructor() {
    this.groq = new Groq({ apiKey: config.groqApiKey });
    this.model = config.groqModel || 'llama-3.3-70b-versatile';
  }

  async generateCode(prompt: string, language: string): Promise<string> {
    const fullPrompt = `Generate ${language} code for: ${prompt}. Return only the code without any explanations, markdown formatting, or code blocks. Just the raw code.`;

    try {
      
      const response = await this.groq.chat.completions.create({
        messages: [
          { role: 'system', content: `You are a helpful code assistant. Generate clean, well-documented ${language} code. Return ONLY the raw code without any markdown formatting, code blocks, or explanations.` },
          { role: 'user', content: fullPrompt }
        ],
        model: this.model,
        temperature: 0.7,
        max_tokens: 4096,
      });

      const generated = response.choices[0]?.message?.content || '';
      
      return generated;
    } catch (error: any) {
      console.error('Groq generateCode error:', error.message);
      throw new Error(`Failed to generate code: ${error.message}`);
    }
  }

  async generateText(prompt: string): Promise<string> {
    try {
      const response = await this.groq.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are a helpful assistant. Return ONLY the requested text without any explanations, markdown, or extra formatting.' },
          { role: 'user', content: prompt }
        ],
        model: this.model,
        temperature: 0.5,
        max_tokens: 200,
      });

      return response.choices[0]?.message?.content || '';
    } catch (error: any) {
      console.error('Groq generateText error:', error.message);
      return '';
    }
  }

  async explainCode(code: string, language: string): Promise<string> {
    const prompt = `Explain this ${language} code in detail. Describe what it does, how it works, and any important details:\n\n${code}`;

    try {
      const response = await this.groq.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are a code explainer. Provide clear, beginner-friendly explanations of code. Use plain English and avoid markdown formatting.' },
          { role: 'user', content: prompt }
        ],
        model: this.model,
        temperature: 0.5,
        max_tokens: 2048,
      });

      return response.choices[0]?.message?.content || '';
    } catch (error: any) {
      console.error('Groq explainCode error:', error.message);
      throw new Error(`Failed to explain code: ${error.message}`);
    }
  }

  async optimizeCode(code: string, language: string): Promise<string> {
    const prompt = `Optimize this ${language} code for better performance, readability, and best practices. Return only the optimized code without any explanations or markdown formatting:\n\n${code}`;

    try {
      const response = await this.groq.chat.completions.create({
        messages: [
          { role: 'system', content: `You are a code optimization expert. Return ONLY the raw optimized code without any markdown formatting, code blocks, or explanations.` },
          { role: 'user', content: prompt }
        ],
        model: this.model,
        temperature: 0.3,
        max_tokens: 4096,
      });

      return response.choices[0]?.message?.content || '';
    } catch (error: any) {
      console.error('Groq optimizeCode error:', error.message);
      throw new Error(`Failed to optimize code: ${error.message}`);
    }
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    try {
      const response = await this.groq.chat.completions.create({
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        model: this.model,
        temperature: 0.7,
        max_tokens: 4096,
      });

      return response.choices[0]?.message?.content || '';
    } catch (error: any) {
      console.error('Groq chat error:', error.message);
      throw new Error(`Failed to chat with AI: ${error.message}`);
    }
  }

  async checkHealth(): Promise<{ available: boolean; models?: string[] }> {
    try {
      await this.groq.chat.completions.create({
        messages: [{ role: 'user', content: 'test' }],
        model: this.model,
        max_tokens: 1,
      });
      return { available: true, models: [this.model] };
    } catch (error) {
      return { available: false };
    }
  }
}

export const groqService = new GroqService();