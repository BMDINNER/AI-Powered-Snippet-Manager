import { Request, Response } from 'express';
import aiService from '../services/ai-service';

export const generateSnippet = async (req: Request, res: Response) => {
  try {
    const { title, description, language } = req.body;

    if (!title || !description || !language) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and language are required'
      });
    }

    const code = await aiService.generateSnippet(title, description, language);

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

    const improvedCode = await aiService.improveSnippet(code, instructions);

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

    const explanation = await aiService.explainCode(code);

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

export const checkHealth = async (req: Request, res: Response) => {
  try {
    const isHealthy = await aiService.checkHealth();
    res.json({
      success: true,
      data: {
        healthy: isHealthy,
        model: process.env.LLAMA_MODEL || 'llama3.2:3b-instruct-q4_K_M'
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