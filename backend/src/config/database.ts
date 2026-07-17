import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function connectDatabase() {
  try {
    await prisma.$connect();
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

export { prisma };