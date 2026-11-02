import dotenv from 'dotenv';
import path from 'path';

const envCandidates = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '..', '.env'),
  path.resolve(process.cwd(), 'backend', '.env')
];

for (const envPath of envCandidates) {
  dotenv.config({ path: envPath });
}

const requiredEnvVars = ['DATABASE_URL', 'PROJECT_ID', 'API_KEY', 'AUTH_SERVICE_URL'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`FATAL ERROR: ${envVar} is not set in environment`);
    process.exit(1);
  }
}

const groqApiKey = process.env.GROQ_API_KEY || '';
const groqModel = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

export const config = {
  port: parseInt(process.env.PORT || '3002'),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'https://snippet-frontend-ujc2.onrender.com',
  databaseUrl: process.env.DATABASE_URL as string,
  authServiceUrl: process.env.AUTH_SERVICE_URL || 'https://auth-service-xo0o.onrender.com',
  projectId: process.env.PROJECT_ID || '',
  apiKey: process.env.API_KEY || '',
  groqApiKey,
  groqModel,
  corsOrigin: process.env.CORS_ORIGIN || 'https://snippet-frontend-ujc2.onrender.com',
};