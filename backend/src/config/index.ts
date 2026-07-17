import dotenv from 'dotenv';
import path from 'path';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
}

console.log('=== ENVIRONMENT VARIABLES CHECK ===');
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'PRESENT' : 'MISSING');
console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY ? 'PRESENT' : 'MISSING');
console.log('PROJECT_ID:', process.env.PROJECT_ID ? 'PRESENT' : 'MISSING');
console.log('API_KEY:', process.env.API_KEY ? 'PRESENT' : 'MISSING');
console.log('AUTH_SERVICE_URL:', process.env.AUTH_SERVICE_URL ? 'PRESENT' : 'MISSING');

const requiredEnvVars = ['DATABASE_URL', 'GROQ_API_KEY', 'PROJECT_ID', 'API_KEY', 'AUTH_SERVICE_URL'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`FATAL ERROR: ${envVar} is not set in environment`);
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
  groqApiKey: process.env.GROQ_API_KEY || '',
  groqModel: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
};