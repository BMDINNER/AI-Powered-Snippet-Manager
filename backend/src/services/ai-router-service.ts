import { config } from '../config/index.js';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface RouterChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
}

export class AiRouterService {
  private readonly baseUrl: string;
  private readonly apiKey?: string;
  private readonly model: string;

  constructor() {
    this.baseUrl = (config.aiRouterBaseUrl || 'http://localhost:4100/v1').replace(/\/+$/, '');
    this.apiKey = config.aiRouterApiKey || undefined;
    this.model = config.aiRouterModel || 'openai/gpt-oss-120b';
  }

  private async callRouter(messages: ChatMessage[], options: { temperature?: number; maxTokens?: number }, modelOverride?: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {})
      },
      body: JSON.stringify({
        model: modelOverride || this.model,
        messages: messages.map((message) => ({ role: message.role, content: message.content })),
        temperature: options.temperature,
        max_tokens: options.maxTokens,
        stream: false
      })
    });

    const payload = (await response.json().catch(() => ({}))) as RouterChatCompletionResponse;
    if (!response.ok) {
      const detail = payload.error?.message || `HTTP ${response.status}`;
      throw new Error(`AI Router request failed: ${detail}`);
    }

    return payload.choices?.[0]?.message?.content || '';
  }

  async generateCode(prompt: string, language: string): Promise<string> {
    const fullPrompt = `Generate ${language} code for: ${prompt}. Return only the code without any explanations, markdown formatting, or code blocks. Just the raw code.`;

    try {
      return await this.callRouter(
        [
          {
            role: 'system',
            content: `You are a helpful code assistant. Generate clean, well-documented ${language} code. Return ONLY the raw code without any markdown formatting, code blocks, or explanations.`
          },
          { role: 'user', content: fullPrompt }
        ],
        { temperature: 0.7, maxTokens: 4096 }
      );
    } catch (error: any) {
      console.error('AI Router generateCode error:', error.message);
      throw new Error(`Failed to generate code: ${error.message}`);
    }
  }

  async generateText(prompt: string): Promise<string> {
    try {
      return await this.callRouter(
        [
          {
            role: 'system',
            content: 'You are a helpful assistant. Return ONLY the requested text without any explanations, markdown, or extra formatting.'
          },
          { role: 'user', content: prompt }
        ],
        { temperature: 0.5, maxTokens: 200 }
      );
    } catch (error: any) {
      console.error('AI Router generateText error:', error.message);
      return '';
    }
  }

  async explainCode(code: string): Promise<string> {
    const prompt = `Explain this code in detail. Describe what it does, how it works, and any important details. Write in clear, simple English. Use proper formatting with paragraphs and bullet points where appropriate:\n\n${code}`;

    try {
      return await this.callRouter(
        [
          {
            role: 'system',
            content: 'You are a code explainer. Provide clear, beginner-friendly explanations of code. Use plain English, proper paragraphs, and bullet points for lists. Do NOT use markdown code blocks or backticks in your explanation unless showing a short code example. Keep the explanation focused on WHAT the code does and HOW it works.'
          },
          { role: 'user', content: prompt }
        ],
        { temperature: 0.4, maxTokens: 2048 }
      );
    } catch (error: any) {
      console.error('AI Router explainCode error:', error.message);
      throw new Error(`Failed to explain code: ${error.message}`);
    }
  }

  async optimizeCode(code: string, language: string): Promise<string> {
    const prompt = `Optimize the following ${language} code for better performance, readability, and best practices. Keep the functionality exactly the same. Do NOT change the purpose of the code. Do NOT add recursive or repeated optimizations. Return ONLY the optimized raw code without any explanations or markdown formatting:\n\n${code}`;

    try {
      return await this.callRouter(
        [
          {
            role: 'system',
            content: `You are a code optimization expert. Optimize the code once and return ONLY the raw optimized ${language} code. Do NOT add recursive optimization or repeat the same code multiple times. Do NOT add markdown formatting, code blocks, or explanations.`
          },
          { role: 'user', content: prompt }
        ],
        { temperature: 0.2, maxTokens: 4096 }
      );
    } catch (error: any) {
      console.error('AI Router optimizeCode error:', error.message);
      throw new Error(`Failed to optimize code: ${error.message}`);
    }
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    try {
      return await this.callRouter(messages, { temperature: 0.7, maxTokens: 4096 });
    } catch (error: any) {
      console.error('AI Router chat error:', error.message);
      throw new Error(`Failed to chat with AI: ${error.message}`);
    }
  }

  async checkHealth(): Promise<{ available: boolean; models?: string[] }> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {})
        }
      });

      if (!response.ok) {
        return { available: false };
      }

      const payload = (await response.json().catch(() => ({}))) as { data?: Array<{ id?: string }> };
      return { available: true, models: payload.data?.map((item) => item.id || '').filter(Boolean) || [this.model] };
    } catch (error) {
      return { available: false };
    }
  }
}

export const aiRouterService = new AiRouterService();
export default aiRouterService;
