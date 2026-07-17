import { Request, Response } from 'express';
import { groqService } from '../services/groq-service.js';

const stripCodeBlock = (code: string): string => {
  if (!code) return '';
  
  let cleaned = code.trim();
  
  const codeBlockMatch = cleaned.match(/```(?:\w+)?\n([\s\S]*?)```/);
  if (codeBlockMatch && codeBlockMatch[1]) {
    cleaned = codeBlockMatch[1].trim();
  }
  
  const inlineCodeMatch = cleaned.match(/`([^`]+)`/);
  if (inlineCodeMatch && inlineCodeMatch[1] && !cleaned.includes('\n')) {
    cleaned = inlineCodeMatch[1].trim();
  }
  
  return cleaned;
};

export const generateSnippet = async (req: Request, res: Response) => {
  try {
    const { prompt, language } = req.body;

    if (!prompt || !language) {
      return res.status(400).json({
        success: false,
        message: 'Prompt and language are required'
      });
    }

    let code = await groqService.generateCode(prompt, language);
    code = stripCodeBlock(code);

    const titlePrompt = `Generate a short, descriptive title (max 5 words) for a code snippet that does this: ${prompt}. Return ONLY the title, nothing else.`;
    let title = await groqService.generateText(titlePrompt);
    title = title.replace(/^["']|["']$/g, '').trim();

    const tagsPrompt = `Generate 3-5 relevant tags (single words, comma-separated) for a code snippet that does this: ${prompt}. Return ONLY the tags, nothing else. Example format: react, api, hooks`;
    const tagsResponse = await groqService.generateText(tagsPrompt);
    const tags = tagsResponse.split(',').map(t => t.trim().replace(/^["']|["']$/g, '')).filter(Boolean);

    res.json({
      success: true,
      data: {
        code,
        language,
        title: title || prompt.split(' ').slice(0, 5).join(' ') + '...',
        description: prompt,
        tags: tags.length > 0 ? tags : ['code', 'snippet']
      }
    });
  } catch (error: any) {
    console.error('Generate snippet error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate snippet'
    });
  }
};

export const improveSnippet = async (req: Request, res: Response) => {
  try {
    const { code, instructions } = req.body;

    if (!code || !instructions) {
      return res.status(400).json({
        success: false,
        message: 'Code and instructions are required'
      });
    }

    let improvedCode = await groqService.optimizeCode(code, 'code');
    improvedCode = stripCodeBlock(improvedCode);

    res.json({
      success: true,
      data: {
        code: improvedCode
      }
    });
  } catch (error: any) {
    console.error('Improve snippet error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to improve snippet'
    });
  }
};

export const explainCode = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Code is required'
      });
    }

    const explanation = await groqService.explainCode(code, 'code');

    res.json({
      success: true,
      data: {
        explanation
      }
    });
  } catch (error: any) {
    console.error('Explain code error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to explain code'
    });
  }
};

export const chatWithAI = async (req: Request, res: Response) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Messages are required'
      });
    }

    const response = await groqService.chat(messages);

    res.json({
      success: true,
      data: {
        response
      }
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to chat with AI'
    });
  }
};

export const checkHealth = async (req: Request, res: Response) => {
  try {
    const health = await groqService.checkHealth();
    res.json({
      success: true,
      data: {
        healthy: health.available,
        model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'
      }
    });
  } catch (error: any) {
    res.json({
      success: true,
      data: {
        healthy: false,
        error: error.message
      }
    });
  }
};