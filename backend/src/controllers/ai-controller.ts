import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { aiService } from '../services/ai-service';
import { ollamaService } from '../services/ollama-service';

export const generateSnippet = async (req: AuthRequest, res: Response) => {
  try {
    const { prompt, language } = req.body;
    
    console.log('Generate snippet request:', { prompt, language, userId: req.user?.userId });
    
    if (!prompt || !language) {
      return res.status(400).json({ error: 'Prompt and language are required' });
    }

    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await aiService.generateSnippetFromPrompt(prompt, language, req.user.userId);
    
    console.log('Generate snippet result:', { 
      title: result.title, 
      codeLength: result.code?.length,
      tags: result.tags 
    });
    
    res.json({
      title: result.title,
      code: result.code,
      language: result.language,
      tags: result.tags,
      description: result.description
    });
  } catch (error: any) {
    console.error('AI generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate snippet',
      message: error.message 
    });
  }
};

export const explainCode = async (req: AuthRequest, res: Response) => {
  try {
    const { code, language } = req.body;
    
    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }

    const explanation = await aiService.explainSnippet(code, language);
    
    res.json({ 
      explanation
    });
  } catch (error: any) {
    console.error('AI explanation error:', error);
    res.status(500).json({ 
      error: 'Failed to explain code',
      message: error.message 
    });
  }
};

export const optimizeCode = async (req: AuthRequest, res: Response) => {
  try {
    const { code, language } = req.body;
    
    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }

    const optimizedCode = await aiService.optimizeExistingCode(code, language);
    
    res.json({ 
      optimizedCode
    });
  } catch (error: any) {
    console.error('AI optimization error:', error);
    res.status(500).json({ 
      error: 'Failed to optimize code',
      message: error.message 
    });
  }
};

export const chat = async (req: AuthRequest, res: Response) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const response = await aiService.chatWithAI(messages);
    
    res.json({ 
      response
    });
  } catch (error: any) {
    console.error('AI chat error:', error);
    res.status(500).json({ 
      error: 'Failed to chat with AI',
      message: error.message 
    });
  }
};

export const getAIStatus = async (req: AuthRequest, res: Response) => {
  try {
    const health = await ollamaService.checkHealth();
    
    res.json({
      available: health.available,
      models: health.models || [],
      url: process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
    });
  } catch (error: any) {
    res.json({
      available: false,
      error: error.message
    });
  }
};