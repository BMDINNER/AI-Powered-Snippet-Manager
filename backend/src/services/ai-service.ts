import { ollamaService } from './ollama-service';
import { CreateSnippetInput } from '../models/snippet-model';
import { OllamaChatMessage } from '../types/ollama-types';

export class AIService {
  async generateSnippetFromPrompt(prompt: string, language: string, userId: string): Promise<CreateSnippetInput> {
    const systemPrompt = `You are a code generation assistant. Generate a complete code snippet based on the user's request.

Separate your response with these exact markers:
TITLE: <your title here>
CODE: <your code here>
TAGS: <tag1>, <tag2>, <tag3>

Example response for JavaScript:
TITLE: Hello World Function
CODE: function helloWorld() {
  console.log('Hello World');
}
TAGS: javascript, function, example

Example response for HTML:
TITLE: Simple Webpage
CODE: <!DOCTYPE html>
<html>
<head>
<title>My Page</title>
</head>
<body>
<h1>Hello World</h1>
</body>
</html>
TAGS: html, webpage, example

Rules:
- Title: max 5 words, descriptive
- Code: return the raw code directly, no escaping needed
- Tags: 3-5 relevant tags, lowercase, comma separated
- Do not add any extra text before or after the markers`;

    const userPrompt = `Generate a ${language} code snippet for: ${prompt}`;

    try {
      const messages: OllamaChatMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ];

      const response = await ollamaService.chat(messages);
      
      console.log('Raw AI response:', response);

      const titleMatch = response.match(/TITLE:\s*(.+?)(?=\nCODE:|$)/s);
      const codeMatch = response.match(/CODE:\s*([\s\S]*?)(?=\nTAGS:|$)/);
      const tagsMatch = response.match(/TAGS:\s*(.+)/);

      const title = titleMatch ? titleMatch[1].trim() : this.generateFallbackTitle(prompt);
      let code = codeMatch ? codeMatch[1].trim() : '';
      const tags = tagsMatch ? tagsMatch[1].split(',').map(t => t.trim().toLowerCase()) : this.generateFallbackTags(language);

      console.log('Extracted:', { title, codeLength: code.length, tags });

      if (!code) {
        throw new Error('AI returned empty code');
      }

      const explanation = await ollamaService.explainCode(code, language);

      return {
        title: title,
        description: prompt,
        code: code,
        language: language,
        tags: tags,
        aiGenerated: true,
        aiExplanation: explanation,
        userId: userId,
      };
    } catch (error: any) {
      console.error('AI generation error:', error);
      throw new Error(`Failed to generate snippet: ${error.message}`);
    }
  }

  private generateFallbackTitle(prompt: string): string {
    const words = prompt.split(' ').slice(0, 5);
    return words.join(' ') + ' Snippet';
  }

  private generateFallbackTags(language: string): string[] {
    return [language.toLowerCase(), 'code', 'snippet'];
  }

  async optimizeExistingCode(code: string, language: string): Promise<string> {
    const systemPrompt = `You are a code optimization assistant. Return ONLY the optimized code. No explanations, no markers, no extra text.`;

    const userPrompt = `Optimize this ${language} code:\n\n${code}`;

    try {
      const messages: OllamaChatMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ];

      let response = await ollamaService.chat(messages);
      response = response.trim();
      
      const codeBlockMatch = response.match(/```(?:\w+)?\n([\s\S]*?)\n```/);
      if (codeBlockMatch) {
        response = codeBlockMatch[1];
      }
      
      return response;
    } catch (error: any) {
      console.error('AI optimization error:', error);
      throw new Error(`Failed to optimize code: ${error.message}`);
    }
  }

  async explainSnippet(code: string, language: string): Promise<string> {
    const systemPrompt = `You are a code explanation assistant. Explain the code clearly and concisely. No markers, no extra formatting.`;

    const userPrompt = `Explain this ${language} code:\n\n${code}`;

    try {
      const messages: OllamaChatMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ];

      const response = await ollamaService.chat(messages);
      return response.trim();
    } catch (error: any) {
      console.error('AI explanation error:', error);
      throw new Error(`Failed to explain code: ${error.message}`);
    }
  }

  async chatWithAI(messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>): Promise<string> {
    const ollamaMessages: OllamaChatMessage[] = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    const response = await ollamaService.chat(ollamaMessages);
    return response;
  }
}

export const aiService = new AIService();