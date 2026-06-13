import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

export async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

export async function checkOllamaHealth(): Promise<{
  available: boolean;
  models: string[];
  error?: string;
}> {
  const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  
  try {
    const tagsResponse = await axios.get(`${ollamaUrl}/api/tags`, {
      timeout: 5000
    });
    
    const models = tagsResponse.data?.models?.map((model: any) => model.name) || [];
    
    return {
      available: true,
      models: models
    };
  } catch (error: any) {
    return {
      available: false,
      models: [],
      error: error.message
    };
  }
}

export { prisma };