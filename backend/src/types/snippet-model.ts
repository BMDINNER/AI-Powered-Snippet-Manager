import { PaginationParams } from "./api-types.js";

export interface Snippet {
  id: string;
  title: string;
  description?: string | null;
  code: string;
  language: string;
  tags: string[];
  category?: string | null;
  createdAt: Date;
  updatedAt: Date;
  aiGenerated: boolean;
  aiExplanation?: string | null;
  userId: string;
}

export interface CreateSnippetInput {
  title: string;
  description?: string;
  code: string;
  language: string;
  tags: string[];
  category?: string;
  aiGenerated?: boolean;
  aiExplanation?: string | null;
  userId: string;
}

export interface UpdateSnippetInput {
  title?: string;
  description?: string;
  code?: string;
  language?: string;
  tags?: string[];
  category?: string;
  aiExplanation?: string;
}

export interface SnippetQuery extends PaginationParams {
  search?: string;
  language?: string;
  tags?: string[];
  category?: string;
  page?: number;
  limit?: number;
  userId?: string;
}


