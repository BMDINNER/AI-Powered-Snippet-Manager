import dotenv from 'dotenv';
import path from 'path';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
}

const requiredEnvVars = ['DATABASE_URL', 'PROJECT_ID', 'API_KEY', 'AUTH_SERVICE_URL'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`FATAL ERROR: ${envVar} is not set in environment`);
    process.exit(1);
  }
}

const aiRouterBaseUrl = process.env.AI_ROUTER_BASE_URL || 'http://localhost:4100/v1';
const aiRouterApiKey = process.env.AI_ROUTER_API_KEY || '';
const aiRouterModel = process.env.AI_ROUTER_MODEL || 'openai/gpt-oss-120b';

export const config = {
  port: parseInt(process.env.PORT || '3002'),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'https://snippet-frontend-ujc2.onrender.com',
  databaseUrl: process.env.DATABASE_URL as string,
  authServiceUrl: process.env.AUTH_SERVICE_URL || 'https://auth-service-xo0o.onrender.com',
  projectId: process.env.PROJECT_ID || '',
  apiKey: process.env.API_KEY || '',
  aiRouterBaseUrl,
  aiRouterApiKey,
  aiRouterModel,
  corsOrigin: process.env.CORS_ORIGIN || 'https://snippet-frontend-ujc2.onrender.com',
};