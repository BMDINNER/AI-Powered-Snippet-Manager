import { Request, Response } from 'express';
import { groqService } from '../services/groq-service.js';

export const generateSnippet = async (req: Request, res: Response) => {
  try {
    const { title, description, language } = req.body;

    if (!title || !description || !language) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and language are required'
      });
    }

    const prompt = `Generate a code snippet in ${language} for the following:
Title: ${title}
Description: ${description}

Provide only the code without any explanations or markdown formatting.`;

    const code = await groqService.generateCode(prompt, language);

    res.json({
      success: true,
      data: {
        code,
        language,
        title,
        description
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

    const improvedCode = await groqService.optimizeCode(code, 'code');

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