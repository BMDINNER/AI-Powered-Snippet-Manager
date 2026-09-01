import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import authRoutes from './routes/auth-routes.js';
import snippetRoutes from './routes/snippet-routes.js';
import aiRoutes from './routes/ai-routes.js';
import { authenticate } from './middleware/auth.js';
import { prisma } from './config/database.js';

const app = express();
app.set('trust proxy', 1);

const port = config.port;

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3005',
  'https://snippet-frontend-ujc2.onrender.com',
  config.corsOrigin
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'x-api-key', 'x-project-id']
}));

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/api/snippets', authenticate, snippetRoutes);
app.use('/api/ai', authenticate, aiRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const waitForDatabase = async (retries = 10, delay = 3000) => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Attempting database connection (${i + 1}/${retries})...`);
      await prisma.$connect();
      console.log('Database connected successfully!');
      return true;
    } catch (error) {
      console.log(`Database not ready yet (attempt ${i + 1})`);
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  return false;
};

const waitForAuthService = async (retries = 10, delay = 3000) => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Attempting to reach Auth Service (${i + 1}/${retries})...`);
      const response = await fetch(`${config.authServiceUrl}/health`);
      if (response.ok) {
        console.log('Auth Service is ready!');
        return true;
      }
    } catch (error) {
      console.log(`Auth Service not ready yet (attempt ${i + 1})`);
    }
    if (i === retries - 1) {
      console.warn('Auth Service not responding, but continuing...');
      return false;
    }
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  return false;
};


const startServer = async () => {
  try {
    await waitForDatabase();
    await waitForAuthService();

    app.listen(port, () => {
      console.log(`Snippet manager backend running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();