export interface User {
  id: string;
  email: string;
  username?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface Snippet {
  id: string;
  title: string;
  description?: string | null;
  code: string;
  language: string;
  tags: string[];
  category?: string | null;
  createdAt: string;
  updatedAt: string;
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
  aiExplanation?: string;
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

export interface SnippetQuery {
  search?: string;
  language?: string;
  tags?: string[];
  category?: string;
  page?: number;
  limit?: number;
  userId?: string;
}

export interface PaginatedResponse<T> {
  snippets: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIGenerateRequest {
  prompt: string;
  language: string;
}

export interface AIOptimizeRequest {
  code: string;
  language: string;
  instructions?: string;
}

export interface AIExplainRequest {
  code: string;
  language: string;
}

export interface AIChatRequest {
  messages: AIMessage[];
}

export interface AIGenerateResponse {
  title: string;
  description: string;
  code: string;
  language: string;
  tags: string[];
}

export interface AIOptimizeResponse {
  optimizedCode: string;
}

export interface AIExplainResponse {
  explanation: string;
}

export interface AIChatResponse {
  response: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}