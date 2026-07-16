import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = ['DATABASE_URL', 'GROQ_API_KEY', 'PROJECT_ID', 'API_KEY', 'AUTH_SERVICE_URL'];

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
  get projectId() {
    return process.env.PROJECT_ID || '';
  },
  get apiKey(){
    return process.env.API_KEY || ''
  },
  groqApiKey: process.env.GROQ_API_KEY || '',
  groqModel: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
};