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

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(
          new Error(`Origin ${origin} not allowed by CORS`)
        );
      }
    },
    credentials: true,
    methods: [
      'GET',
      'POST',
      'PUT',
      'DELETE',
      'OPTIONS'
    ],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'x-api-key',
      'x-project-id'
    ]
  })
);

app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

app.use('/auth', authRoutes);

app.use(
  '/api/snippets',
  authenticate,
  snippetRoutes
);

app.use(
  '/api/ai',
  authenticate,
  aiRoutes
);

const waitForDatabase = async (
  retries = 5,
  delay = 2000
) => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(
        `Database connection attempt ${i + 1}/${retries}...`
      );

      await prisma.$connect();

      console.log('Database connected');

      return true;
    } catch (error) {
      console.log(
        `Database not ready (attempt ${i + 1})`
      );

      if (i === retries - 1) {
        console.error(
          'Database connection failed after all retries'
        );

        return false;
      }

      await new Promise(resolve =>
        setTimeout(resolve, delay)
      );
    }
  }

  return false;
};

const startServer = async () => {
  try {
    console.log('Starting backend...');

    const databaseReady = await waitForDatabase();

    if (!databaseReady) {
      throw new Error(
        'Database could not be connected'
      );
    }

    app.listen(port, () => {
      console.log(
        `Snippet manager backend running on port ${port}`
      );
    });

  } catch (error) {
    console.error(
      'Failed to start server:',
      error
    );

    process.exit(1);
  }
};

startServer();