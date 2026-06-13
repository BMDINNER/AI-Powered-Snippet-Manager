import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import snippetRoutes from './routes/snippet-routes';
import aiRoutes from './routes/ai-routes';
import errorHandler from './middleware/error-handler';
import { connectDatabase, checkOllamaHealth } from './config/database';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(errorHandler);

app.get('/api/health', async (req, res) => {
  const ollamaStatus = await checkOllamaHealth();
  
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'backend',
    database: 'connected',
    ollama: {
      available: ollamaStatus.available,
      models: ollamaStatus.models,
      url: process.env.OLLAMA_BASE_URL
    }
  });
});

app.use('/api/snippets', snippetRoutes);
app.use('/api/ai', aiRoutes);

app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

let dbConnected = false;
let retryCount = 0;
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

async function initializeDatabase() {
  while (retryCount < MAX_RETRIES) {
    dbConnected = await connectDatabase();
    if (dbConnected) break;
    
    retryCount++;
    if (retryCount < MAX_RETRIES) {
      console.warn(`Database connection attempt ${retryCount}/${MAX_RETRIES} failed. Retrying in ${RETRY_DELAY_MS / 1000}s...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
  
  if (!dbConnected) {
    console.error(`FATAL ERROR: Could not connect to database after ${MAX_RETRIES} attempts.`);
    process.exit(1);
  }
  console.log('Database connected successfully.');
}

initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

export default app;