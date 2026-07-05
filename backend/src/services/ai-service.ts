import { ollamaService } from './ollama-service';
import { CreateSnippetInput } from '../models/snippet-model';
import { OllamaChatMessage } from '../types/ollama-types';

export class AIService {
  async generateSnippetFromPrompt(prompt: string, language: string, userId: string): Promise<CreateSnippetInput> {
    const systemPrompt = `You are a code generation assistant. Generate a complete code snippet based on the user's request.

IMPORTANT: You MUST respond in EXACTLY this format with these markers:

TITLE: <your title here>
CODE: <your code here>
TAGS: <tag1>, <tag2>, <tag3>

DO NOT add any extra text, explanations, or markdown formatting outside these markers.

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
- Response MUST contain ONLY these three markers and their content`;

    const userPrompt = `Generate a ${language} code snippet for: ${prompt}`;

    try {
      const messages: OllamaChatMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ];

      let response = await ollamaService.chat(messages);
      
      console.log('Raw AI response:', response);

      // Try to extract with markers first
      let titleMatch = response.match(/TITLE:\s*(.+?)(?=\nCODE:|$)/s);
      let codeMatch = response.match(/CODE:\s*([\s\S]*?)(?=\nTAGS:|$)/);
      let tagsMatch = response.match(/TAGS:\s*(.+)/);

      // If markers not found, try to extract from markdown code blocks
      if (!codeMatch || !codeMatch[1].trim()) {
        console.log('No markers found, trying to extract from markdown...');
        
        // Extract code from markdown block
        const codeBlockMatch = response.match(/```(?:\w+)?\n([\s\S]*?)\n```/);
        if (codeBlockMatch) {
          const extractedCode = codeBlockMatch[1].trim();
          
          // Try to find a title from the response
          const titleLines = response.split('\n').filter(line => 
            !line.match(/```/) && 
            line.trim().length > 0 &&
            !line.includes('function') &&
            !line.includes('console.log') &&
            !line.includes('return')
          );
          
          const title = titleLines.length > 0 ? titleLines[0].trim().slice(0, 50) : this.generateFallbackTitle(prompt);
          
          // Generate tags from language and context
          const tags = this.generateFallbackTags(language);
          
          return {
            title: title,
            description: prompt,
            code: extractedCode,
            language: language,
            tags: tags,
            aiGenerated: true,
            aiExplanation: null,
            userId: userId,
          };
        }
        
        // If no code block, try to find code by looking for function/class definitions
        const lines = response.split('\n');
        let codeStart = -1;
        let codeEnd = lines.length;
        
        for (let i = 0; i < lines.length; i++) {
          const trimmed = lines[i].trim();
          if (trimmed.match(/^(function|class|const|let|var|import|export|def|public|private|interface|type|enum|async|\/\/|\/\*)/)) {
            if (codeStart === -1) codeStart = i;
          } else if (codeStart !== -1 && trimmed.match(/^[A-Z]/) && trimmed.length < 30) {
            // If we hit a line that looks like a title, stop collecting code
            codeEnd = i;
            break;
          }
        }
        
        if (codeStart !== -1) {
          const extractedCode = lines.slice(codeStart, codeEnd).join('\n').trim();
          if (extractedCode) {
            return {
              title: this.generateFallbackTitle(prompt),
              description: prompt,
              code: extractedCode,
              language: language,
              tags: this.generateFallbackTags(language),
              aiGenerated: true,
              aiExplanation: null,
              userId: userId,
            };
          }
        }
      }

      const title = titleMatch ? titleMatch[1].trim() : this.generateFallbackTitle(prompt);
      let code = codeMatch ? codeMatch[1].trim() : '';
      const tags = tagsMatch ? tagsMatch[1].split(',').map(t => t.trim().toLowerCase()) : this.generateFallbackTags(language);

      console.log('Extracted:', { title, codeLength: code.length, tags });

      if (!code) {
        throw new Error('AI returned empty code');
      }

      return {
        title: title,
        description: prompt,
        code: code,
        language: language,
        tags: tags,
        aiGenerated: true,
        aiExplanation: null,
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