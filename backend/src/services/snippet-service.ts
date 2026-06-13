import { prisma } from '../config/database';
import { 
  Snippet, 
  CreateSnippetInput, 
  UpdateSnippetInput, 
  SnippetQuery 
} from '../models/snippet-model';

export class SnippetService {
  async createSnippet(data: CreateSnippetInput): Promise<Snippet> {
    console.log('SERVICE CREATE SNIPPET:', {
      title: data.title,
      codeLength: data.code?.length,
      language: data.language,
      tags: data.tags
    });

    const snippet = await prisma.snippet.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        code: data.code,
        language: data.language,
        tags: data.tags,
        category: data.category ?? null,
        aiGenerated: data.aiGenerated ?? false,
        aiExplanation: data.aiExplanation ?? null,
        userId: data.userId
      },
    });
    
    console.log('SERVICE SNIPPET CREATED, tags:', snippet.tags);
    
    return {
      id: snippet.id,
      title: snippet.title,
      description: snippet.description,
      code: snippet.code,
      language: snippet.language,
      tags: snippet.tags,
      category: snippet.category,
      aiGenerated: snippet.aiGenerated,
      aiExplanation: snippet.aiExplanation,
      userId: snippet.userId,
      createdAt: snippet.createdAt,
      updatedAt: snippet.updatedAt
    };
  }

  async getSnippetById(id: string, userId?: string): Promise<Snippet | null> {
    const where: any = { id };
    if (userId) {
      where.userId = userId;
    }
    
    const snippet = await prisma.snippet.findUnique({
      where,
    });
    
    if (!snippet) {
      return null;
    }
    
    return {
      id: snippet.id,
      title: snippet.title,
      description: snippet.description,
      code: snippet.code,
      language: snippet.language,
      tags: snippet.tags,
      category: snippet.category,
      aiGenerated: snippet.aiGenerated,
      aiExplanation: snippet.aiExplanation,
      userId: snippet.userId,
      createdAt: snippet.createdAt,
      updatedAt: snippet.updatedAt
    };
  }

  async getAllSnippets(query: SnippetQuery): Promise<{ snippets: Snippet[]; total: number }> {
    const {
      search,
      language,
      tags,
      category,
      page = 1,
      limit = 10,
      userId
    } = query;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } }
      ];
      console.log('Searching for:', search);
    }

    if (language) {
      where.language = language;
    }

    if (tags && tags.length > 0) {
      console.log('Filtering by tags:', tags);
      where.tags = { hasSome: tags };
    }

    if (category) {
      where.category = category;
    }

    console.log('Final where clause:', JSON.stringify(where, null, 2));

    const [snippets, total] = await Promise.all([
      prisma.snippet.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.snippet.count({ where }),
    ]);

    console.log(`Found ${snippets.length} snippets out of ${total} total`);
    snippets.forEach(s => {
      console.log(`Snippet "${s.title}" has tags:`, s.tags);
    });

    const serializedSnippets = snippets.map(snippet => ({
      id: snippet.id,
      title: snippet.title,
      description: snippet.description,
      code: snippet.code,
      language: snippet.language,
      tags: snippet.tags,
      category: snippet.category,
      aiGenerated: snippet.aiGenerated,
      aiExplanation: snippet.aiExplanation,
      userId: snippet.userId,
      createdAt: snippet.createdAt,
      updatedAt: snippet.updatedAt
    }));

    return { snippets: serializedSnippets, total };
  }

  async updateSnippet(id: string, data: UpdateSnippetInput, userId?: string): Promise<Snippet> {
    const where: any = { id };
    if (userId) {
      where.userId = userId;
    }

    const updateData: any = {};
    
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.code !== undefined) updateData.code = data.code;
    if (data.language !== undefined) updateData.language = data.language;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.aiExplanation !== undefined) updateData.aiExplanation = data.aiExplanation;
    
    updateData.updatedAt = new Date();

    const snippet = await prisma.snippet.update({
      where,
      data: updateData,
    });
    
    return {
      id: snippet.id,
      title: snippet.title,
      description: snippet.description,
      code: snippet.code,
      language: snippet.language,
      tags: snippet.tags,
      category: snippet.category,
      aiGenerated: snippet.aiGenerated,
      aiExplanation: snippet.aiExplanation,
      userId: snippet.userId,
      createdAt: snippet.createdAt,
      updatedAt: snippet.updatedAt
    };
  }

  async deleteSnippet(id: string, userId?: string): Promise<void> {
    const where: any = { id };
    if (userId) {
      where.userId = userId;
    }

    await prisma.snippet.delete({
      where,
    });
  }

  async getLanguages(userId?: string): Promise<string[]> {
    const where: any = {};
    if (userId) {
      where.userId = userId;
    }

    const languages = await prisma.snippet.findMany({
      where,
      distinct: ['language'],
      select: { language: true },
    });
    return languages.map((l: { language: string }) => l.language);
  }

  async getTags(userId?: string): Promise<string[]> {
    const where: any = {};
    if (userId) {
      where.userId = userId;
    }

    const snippets = await prisma.snippet.findMany({
      where,
      select: { tags: true },
    });
    
    const allTags = snippets.flatMap((snippet: { tags: string[] }) => snippet.tags);
    return Array.from(new Set(allTags));
  }

  async getCategories(userId?: string): Promise<string[]> {
    const where: any = {};
    if (userId) {
      where.userId = userId;
    }

    const categories = await prisma.snippet.findMany({
      where: { ...where, category: { not: null } },
      distinct: ['category'],
      select: { category: true },
    });
    return categories
      .map((c: { category: string | null }) => c.category)
      .filter((category): category is string => category !== null);
  }
}

export const snippetService = new SnippetService();