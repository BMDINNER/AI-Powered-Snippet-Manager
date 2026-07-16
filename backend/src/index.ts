import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import authRoutes from './routes/auth-routes.js';
import snippetRoutes from './routes/snippet-routes.js';
import aiRoutes from './routes/ai-routes.js';
import { authenticate } from './middleware/auth.js';

const app = express();
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
      console.log('Blocked origin:', origin);
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

app.listen(port, () => {
  console.log(`Snippet manager backend running on port ${port}`);
});
