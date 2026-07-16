import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = ['DATABASE_URL'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`FATAL ERROR: ${envVar} is not set in .env file`);
    process.exit(1);
  }
}

export const config = {
  port: parseInt(process.env.PORT || '3002'),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  databaseUrl: process.env.DATABASE_URL as string,
  authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  projectId: process.env.PROJECT_ID || '',
  apiKey: process.env.API_KEY || '',
  llamaBaseUrl: process.env.LLAMA_BASE_URL || 'http://localhost:8080',
  llamaModel: process.env.LLAMA_MODEL || 'llama3.2:3b-instruct-q4_K_M',
};