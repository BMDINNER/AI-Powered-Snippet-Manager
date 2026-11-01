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

  private sanitizeIdentifier(value: string): string {
    return value
      .replace(/[^a-zA-Z0-9_]/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((segment, index) => index === 0 ? segment.charAt(0).toLowerCase() + segment.slice(1) : segment.charAt(0).toUpperCase() + segment.slice(1))
      .join('') || 'snippet';
  }

  private buildFallbackCode(prompt: string, language: string): string {
    const normalized = (language || 'javascript').toLowerCase();
    const safeName = this.sanitizeIdentifier(prompt || 'snippet');
    const exampleInput = JSON.stringify(prompt || 'Sample input');

    switch (normalized) {
      case 'typescript':
      case 'ts':
        return 'function ' + safeName + '(input: string): string {\n  console.log(input);\n  return input;\n}\n\nconst result: string = ' + safeName + '(' + exampleInput + ');\nconsole.log(result);';
      case 'python':
      case 'py':
        return 'def ' + safeName + '(text: str) -> str:\n    print(text)\n    return text\n\nresult = ' + safeName + '(' + exampleInput + ')\nprint(result)';
      case 'java':
        return 'public class ' + safeName + ' {\n  public static void main(String[] args) {\n    String text = ' + exampleInput + ';\n    System.out.println(text);\n  }\n}';
      case 'c#':
      case 'csharp':
        return 'using System;\n\nclass ' + safeName + ' {\n  static void Main() {\n    string text = ' + exampleInput + ';\n    Console.WriteLine(text);\n  }\n}';
      case 'go':
      case 'golang':
        return 'package main\n\nimport "fmt"\n\nfunc ' + safeName + '(text string) string {\n  fmt.Println(text)\n  return text\n}\n\nfunc main() {\n  result := ' + safeName + '(' + exampleInput + ')\n  fmt.Println(result)\n}';
      case 'php':
        return '<?php\nfunction ' + safeName + '($text) {\n  echo $text;\n  return $text;\n}\n\n$result = ' + safeName + '(' + exampleInput + ');\nprint_r($result);';
      default:
        return 'function ' + safeName + '() {\n  const input = ' + exampleInput + ';\n  console.log(input);\n  return input;\n}\n\n' + safeName + '();';
    }
  }

  private buildFallbackOptimizedCode(code: string, language: string): string {
    const normalized = (language || 'javascript').toLowerCase();
    const inputCode = code.trim() || 'console.log("hello")';

    if (normalized === 'python' || normalized === 'py') {
      return 'def optimized_example(data):\n    if not data:\n        return None\n    return data.strip().lower()\n\nprint(optimized_example(' + JSON.stringify(inputCode) + '))';
    }

    if (normalized === 'typescript' || normalized === 'ts') {
      return 'const optimizedExample = (value: string): string => value.trim().toLowerCase();\n\nconsole.log(optimizedExample(' + JSON.stringify(inputCode) + '));';
    }

    return 'function optimizedExample(value) {\n  return String(value).trim().toLowerCase();\n}\n\nconsole.log(optimizedExample(' + JSON.stringify(inputCode) + '));';
  }

  private buildFallbackText(prompt: string): string {
    const words = prompt
      .replace(/[^a-zA-Z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 4);

    return words.length > 0 ? words.join(' ') : 'Generated snippet';
  }

  private buildFallbackExplanation(code: string): string {
    const summary = code
      .replace(/\s+/g, ' ')
      .trim();

    const preview = summary.length > 300 ? summary.slice(0, 300) + '...' : summary;
    return 'This code is currently running in fallback mode because the AI router is unavailable.\n\nThe snippet appears to perform the following general tasks:\n- read the provided input\n- process or transform it\n- output the result in a readable form\n\nOriginal code preview:\n' + preview;
  }

  private async callRouter(messages: ChatMessage[], options: { temperature?: number; maxTokens?: number }, modelOverride?: string): Promise<string> {
    const response = await fetch(this.baseUrl + '/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(this.apiKey ? { Authorization: 'Bearer ' + this.apiKey } : {})
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
      const detail = payload.error?.message || 'HTTP ' + response.status;
      throw new Error('AI Router request failed: ' + detail);
    }

    return payload.choices?.[0]?.message?.content || '';
  }

  async generateCode(prompt: string, language: string): Promise<string> {
    const fullPrompt = 'Generate ' + language + ' code for: ' + prompt + '. Return only the code without any explanations, markdown formatting, or code blocks. Just the raw code.';

    try {
      return await this.callRouter(
        [
          {
            role: 'system',
            content: 'You are a helpful code assistant. Generate clean, well-documented ' + language + ' code. Return ONLY the raw code without any markdown formatting, code blocks, or explanations.'
          },
          { role: 'user', content: fullPrompt }
        ],
        { temperature: 0.7, maxTokens: 4096 }
      );
    } catch (error: any) {
      const fallback = this.buildFallbackCode(prompt, language);
      console.warn('AI Router unavailable, using fallback code generation:', error.message || error);
      return fallback;
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
      const fallback = this.buildFallbackText(prompt);
      console.warn('AI Router unavailable, using fallback text generation:', error.message || error);
      return fallback;
    }
  }

  async explainCode(code: string): Promise<string> {
    const prompt = 'Explain this code in detail. Describe what it does, how it works, and any important details. Write in clear, simple English. Use proper formatting with paragraphs and bullet points where appropriate:\n\n' + code;

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
      const fallback = this.buildFallbackExplanation(code);
      console.warn('AI Router unavailable, using fallback explanation:', error.message || error);
      return fallback;
    }
  }

  async optimizeCode(code: string, language: string): Promise<string> {
    const prompt = 'Optimize the following ' + language + ' code for better performance, readability, and best practices. Keep the functionality exactly the same. Do NOT change the purpose of the code. Do NOT add recursive or repeated optimizations. Return ONLY the optimized raw code without any explanations or markdown formatting:\n\n' + code;

    try {
      return await this.callRouter(
        [
          {
            role: 'system',
            content: 'You are a code optimization expert. Optimize the code once and return ONLY the raw optimized ' + language + ' code. Do NOT add recursive optimization or repeat the same code multiple times. Do NOT add markdown formatting, code blocks, or explanations.'
          },
          { role: 'user', content: prompt }
        ],
        { temperature: 0.2, maxTokens: 4096 }
      );
    } catch (error: any) {
      const fallback = this.buildFallbackOptimizedCode(code, language);
      console.warn('AI Router unavailable, using fallback optimization:', error.message || error);
      return fallback;
    }
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    try {
      return await this.callRouter(messages, { temperature: 0.7, maxTokens: 4096 });
    } catch (error: any) {
      const lastUserMessage = [...messages].reverse().find((message) => message.role === 'user')?.content || 'Hello';
      const fallback = 'I’m currently offline because the AI router is unavailable.\n\nYour last message: "' + lastUserMessage + '"\n\nIf you want, I can still help you with a short answer or by suggesting a code example.';
      console.warn('AI Router unavailable, using fallback chat response:', error.message || error);
      return fallback;
    }
  }

  async checkHealth(): Promise<{ available: boolean; models?: string[] }> {
    try {
      const response = await fetch(this.baseUrl + '/models', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          ...(this.apiKey ? { Authorization: 'Bearer ' + this.apiKey } : {})
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
