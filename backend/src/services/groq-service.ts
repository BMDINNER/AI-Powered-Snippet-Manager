import Groq from 'groq-sdk';
import { config } from '../config/index.js';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class GroqService {
  private readonly apiKey: string;
  private readonly client: Groq;
  private readonly model: string;

  constructor() {
    this.apiKey = (config.groqApiKey || process.env.GROQ_API_KEY || '').trim();
    this.model = config.groqModel || process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
    this.client = new Groq({ apiKey: this.apiKey || 'dummy-key' });
  }

  private ensureConfigured(): void {
    if (!this.apiKey || this.apiKey === 'dummy-key') {
      throw new Error('GROQ_API_KEY is not configured. Add GROQ_API_KEY to your environment before running AI features.');
    }
  }

  private sanitizeIdentifier(value: string): string {
    return value
      .replace(/[^a-zA-Z0-9_]/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((segment, index) => {
        const first = segment.charAt(0);
        const rest = segment.slice(1);
        return index === 0 ? first.toLowerCase() + rest : first.toUpperCase() + rest;
      })
      .join('') || 'snippet';
  }

  private buildFallbackCode(prompt: string, language: string): string {
    const normalized = (language || 'javascript').toLowerCase();
    const safeName = this.sanitizeIdentifier(prompt || 'snippet');
    const exampleInput = JSON.stringify(prompt || 'Sample input');

    switch (normalized) {
      case 'typescript':
      case 'ts':
        return `function ${safeName}(input: string): string {\n  console.log(input);\n  return input;\n}\n\nconst result: string = ${safeName}(${exampleInput});\nconsole.log(result);`;
      case 'python':
      case 'py':
        return `def ${safeName}(text: str) -> str:\n    print(text)\n    return text\n\nresult = ${safeName}(${exampleInput})\nprint(result)`;
      case 'java':
        return `public class ${safeName} {\n  public static void main(String[] args) {\n    String text = ${exampleInput};\n    System.out.println(text);\n  }\n}`;
      case 'c#':
      case 'csharp':
        return `using System;\n\nclass ${safeName} {\n  static void Main() {\n    string text = ${exampleInput};\n    Console.WriteLine(text);\n  }\n}`;
      case 'go':
      case 'golang':
        return `package main\n\nimport "fmt"\n\nfunc ${safeName}(text string) string {\n  fmt.Println(text)\n  return text\n}\n\nfunc main() {\n  result := ${safeName}(${exampleInput})\n  fmt.Println(result)\n}`;
      case 'php':
        return `<?php\nfunction ${safeName}($text) {\n  echo $text;\n  return $text;\n}\n\n$result = ${safeName}(${exampleInput});\nprint_r($result);`;
      default:
        return `function ${safeName}() {\n  const input = ${exampleInput};\n  console.log(input);\n  return input;\n}\n\n${safeName}();`;
    }
  }

  private buildFallbackText(prompt: string): string {
    const words = prompt
      .replace(/[^a-zA-Z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 4);

    return words.length > 0 ? words.join(' ') : 'Generated snippet';
  }

  private buildFallbackOptimizedCode(code: string, language: string): string {
    const normalized = (language || 'javascript').toLowerCase();
    const inputCode = code.trim() || 'console.log("hello")';

    if (normalized === 'python' || normalized === 'py') {
      return `def optimized_example(data):\n    if not data:\n        return None\n    return data.strip().lower()\n\nprint(optimized_example(${JSON.stringify(inputCode)}))`;
    }

    if (normalized === 'typescript' || normalized === 'ts') {
      return `const optimizedExample = (value: string): string => value.trim().toLowerCase();\n\nconsole.log(optimizedExample(${JSON.stringify(inputCode)}));`;
    }

    return `function optimizedExample(value) {\n  return String(value).trim().toLowerCase();\n}\n\nconsole.log(optimizedExample(${JSON.stringify(inputCode)}));`;
  }

  private buildFallbackExplanation(code: string): string {
    const summary = code.replace(/\s+/g, ' ').trim();
    const preview = summary.length > 300 ? summary.slice(0, 300) + '...' : summary;

    return `This code is currently running in fallback mode because the Groq API is unavailable.\n\nThe snippet appears to perform the following general tasks:\n- read the provided input\n- process or transform it\n- output the result in a readable form\n\nOriginal code preview:\n${preview}`;
  }

  private async callGroq(messages: ChatMessage[], options: { temperature?: number; maxTokens?: number } = {}, modelOverride?: string): Promise<string> {
    this.ensureConfigured();

    const response = await this.client.chat.completions.create({
      model: modelOverride || this.model,
      messages: messages.map((message) => ({ role: message.role, content: message.content })),
      temperature: options.temperature,
      max_tokens: options.maxTokens,
      stream: false
    });

    const content: any = response.choices?.[0]?.message?.content;
    if (typeof content === 'string') {
      return content;
    }

    if (Array.isArray(content)) {
      return content
        .map((part: any) => (typeof part?.text === 'string' ? part.text : ''))
        .join('');
    }

    return '';
  }

  async generateCode(prompt: string, language: string): Promise<string> {
    const fullPrompt = `Generate ${language} code for: ${prompt}. Return only the code without any explanations, markdown formatting, or code blocks. Just the raw code.`;

    try {
      return await this.callGroq(
        [
          {
            role: 'system',
            content: `You are a helpful code assistant. Generate clean, well-documented ${language} code. Return ONLY the raw code without markdown formatting, code blocks, or explanations.`
          },
          { role: 'user', content: fullPrompt }
        ],
        { temperature: 0.7, maxTokens: 4096 }
      );
    } catch (error: any) {
      if (error?.message?.includes('GROQ_API_KEY is not configured')) {
        throw error;
      }
      console.warn('Groq request failed, using fallback code generation:', error?.message || error);
      return this.buildFallbackCode(prompt, language);
    }
  }

  async generateText(prompt: string): Promise<string> {
    try {
      return await this.callGroq(
        [
          {
            role: 'system',
            content: 'You are a helpful assistant. Return ONLY the requested text without explanations, markdown, or extra formatting.'
          },
          { role: 'user', content: prompt }
        ],
        { temperature: 0.5, maxTokens: 250 }
      );
    } catch (error: any) {
      if (error?.message?.includes('GROQ_API_KEY is not configured')) {
        throw error;
      }
      console.warn('Groq text generation failed, using fallback text:', error?.message || error);
      return this.buildFallbackText(prompt);
    }
  }

  async optimizeCode(code: string, language: string): Promise<string> {
    const prompt = `Optimize this ${language} code for readability, efficiency, and correctness. Return only the improved code with no explanation.`;

    try {
      return await this.callGroq(
        [
          {
            role: 'system',
            content: 'You are an expert code refactoring assistant. Return only valid code, with no markdown fences or explanation.'
          },
          { role: 'user', content: `${prompt}\n\n${code}` }
        ],
        { temperature: 0.4, maxTokens: 4096 }
      );
    } catch (error: any) {
      if (error?.message?.includes('GROQ_API_KEY is not configured')) {
        throw error;
      }
      console.warn('Groq optimization failed, using fallback code:', error?.message || error);
      return this.buildFallbackOptimizedCode(code, language);
    }
  }

  async explainCode(code: string): Promise<string> {
    const prompt = `Explain this code in detail. Describe what it does, how it works, and any important details. Write in clear, simple English. Use paragraphs and bullet points where appropriate.\n\n${code}`;

    try {
      return await this.callGroq(
        [
          {
            role: 'system',
            content: 'You are a code explainer. Provide clear, beginner-friendly explanations of code. Use plain English, good formatting, and no markdown code blocks unless necessary.'
          },
          { role: 'user', content: prompt }
        ],
        { temperature: 0.4, maxTokens: 2048 }
      );
    } catch (error: any) {
      if (error?.message?.includes('GROQ_API_KEY is not configured')) {
        throw error;
      }
      console.warn('Groq explanation failed, using fallback explanation:', error?.message || error);
      return this.buildFallbackExplanation(code);
    }
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    try {
      return await this.callGroq(messages, { temperature: 0.7, maxTokens: 2048 });
    } catch (error: any) {
      if (error?.message?.includes('GROQ_API_KEY is not configured')) {
        throw error;
      }
      console.warn('Groq chat failed:', error?.message || error);
      return 'The Groq AI service is unavailable right now. Please try again in a few moments.';
    }
  }

  async checkHealth(): Promise<{ available: boolean; model: string; message?: string }> {
    try {
      this.ensureConfigured();
      return { available: true, model: this.model };
    } catch (error: any) {
      return {
        available: false,
        model: this.model,
        message: error.message || 'Groq API is not configured.'
      };
    }
  }
}

export const groqService = new GroqService();
export default groqService;
