import { Response, NextFunction } from 'express';
import { snippetService } from '../services/snippet-service.js';
import { SnippetQuery } from '../types/index.js';
import { ApiResponse } from '../types/api-types.js';
import { AuthRequest } from '../middleware/auth.js';

export class SnippetController {
  async createSnippet(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          error: 'Unauthorized'
        };
        res.status(401).json(response);
        return;
      }

      const { title, description, code, language, tags, category, aiGenerated, aiExplanation } = req.body;

      if (!title || !code || !language) {
        const response: ApiResponse = {
          success: false,
          error: 'Validation failed',
          message: 'Title, code, and language are required'
        };
        res.status(400).json(response);
        return;
      }

      const snippet = await snippetService.createSnippet({
        title,
        description,
        code,
        language,
        tags: tags || [],
        category,
        aiGenerated: aiGenerated || false,
        aiExplanation,
        userId: req.user.userId
      });
      
      const response: ApiResponse = {
        success: true,
        data: snippet,
        message: 'Snippet created successfully'
      };
      
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getSnippet(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const snippetId = req.params.id;
      
      if (!snippetId || Array.isArray(snippetId)) {
        const response: ApiResponse = {
          success: false,
          error: 'Invalid snippet ID'
        };
        res.status(400).json(response);
        return;
      }

      const snippet = await snippetService.getSnippetById(snippetId, req.user?.userId);
      
      if (!snippet) {
        const response: ApiResponse = {
          success: false,
          error: 'Snippet not found'
        };
        res.status(404).json(response);
        return;
      }
      
      const response: ApiResponse = {
        success: true,
        data: snippet
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getSnippets(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const search = req.query.search as string;
      const language = req.query.language as string;
      const tags = req.query.tags ? (req.query.tags as string).split(',').map(tag => tag.trim()).filter(tag => tag) : undefined;
      const category = req.query.category as string;

      const query: SnippetQuery = {
        search,
        language,
        tags,
        category,
        page,
        limit,
        userId: req.user?.userId
      };

      const result = await snippetService.getAllSnippets(query);
      
      const response: ApiResponse = {
        success: true,
        data: result.snippets,
        meta: {
          total: result.total,
          page: query.page || 1,
          limit: query.limit || 10,
          pages: Math.ceil(result.total / (query.limit || 10))
        }
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async updateSnippet(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const snippetId = req.params.id;
      
      if (!snippetId || Array.isArray(snippetId)) {
        const response: ApiResponse = {
          success: false,
          error: 'Invalid snippet ID'
        };
        res.status(400).json(response);
        return;
      }

      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          error: 'Unauthorized'
        };
        res.status(401).json(response);
        return;
      }

      const { title, description, code, language, tags, category, aiExplanation } = req.body;

      const snippet = await snippetService.updateSnippet(snippetId, {
        title,
        description,
        code,
        language,
        tags,
        category,
        aiExplanation
      }, req.user.userId);
      
      const response: ApiResponse = {
        success: true,
        data: snippet,
        message: 'Snippet updated successfully'
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async deleteSnippet(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const snippetId = req.params.id;
      
      if (!snippetId || Array.isArray(snippetId)) {
        const response: ApiResponse = {
          success: false,
          error: 'Invalid snippet ID'
        };
        res.status(400).json(response);
        return;
      }

      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          error: 'Unauthorized'
        };
        res.status(401).json(response);
        return;
      }

      await snippetService.deleteSnippet(snippetId, req.user.userId);
      
      const response: ApiResponse = {
        success: true,
        message: 'Snippet deleted successfully'
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getLanguages(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const languages = await snippetService.getLanguages(req.user?.userId);
      
      const response: ApiResponse = {
        success: true,
        data: languages
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getTags(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const tags = await snippetService.getTags(req.user?.userId);
      
      const response: ApiResponse = {
        success: true,
        data: tags
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getCategories(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await snippetService.getCategories(req.user?.userId);
      
      const response: ApiResponse = {
        success: true,
        data: categories
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const snippetController = new SnippetController();