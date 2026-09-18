import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from './config/index.js';
import authRoutes from './routes/auth-routes.js';
import snippetRoutes from './routes/snippet-routes.js';
import aiRoutes from './routes/ai-routes.js';
import { prisma } from './config/prisma.js';

const app = express();
app.set('trust proxy', 1);

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3005',
  'https://snippet-frontend.onrender.com',
  'https://snippet-frontend-ujc2.onrender.com',
  process.env.CLIENT_URL
].filter(Boolean) as string[];

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        styleSrcElem: ["'self'", "'unsafe-inline'"],
        fontSrc: ["'self'"],
        imgSrc: ["'self'", 'data:'],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'"],
        frameSrc: ["'self'"],
        frameAncestors: ["'none'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: []
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    strictTransportSecurity: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    xFrameOptions: { action: 'deny' },
    xssFilter: true,
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
  })
);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'x-api-key',
      'x-project-id'
    ]
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/ping', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      pong: true,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected'
    });
  } catch (error) {
    try {
      await prisma.$connect();
      res.json({
        pong: true,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: 'reconnected'
      });
    } catch (reconnectError) {
      console.error('[Ping] Failed to reconnect database:', reconnectError);
      res.status(503).json({
        pong: false,
        error: 'Database connection failed',
        timestamp: new Date().toISOString()
      });
    }
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/snippets', snippetRoutes);
app.use('/api/ai', aiRoutes);

app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
  }
);

const PORT = config.port;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const connectDatabase = async (retries = 10, delay = 3000): Promise<boolean> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Database connection attempt ${attempt}/${retries}...`);
      await prisma.$connect();
      console.log('Database connected successfully');
      return true;
    } catch (error: any) {
      console.error(`Database connection failed (attempt ${attempt}):`, error.message);
      if (attempt === retries) {
        console.error('All database connection attempts failed');
        return false;
      }
      console.log(`Retrying in ${delay}ms...`);
      await sleep(delay);
      delay *= 1.5;
    }
  }
  return false;
};

async function startServer() {
  console.log('Starting code snippet service...');

  const dbConnected = await connectDatabase();
  if (!dbConnected) {
    console.error('Failed to connect to database on startup');
    process.exit(1);
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Code snippet service running on port ${PORT}`);
    console.log(`Health check available at /health`);
    console.log(`Ping endpoint available at /ping`);
  });

  const gracefulShutdown = async (signal: string) => {
    console.log(`${signal} received, starting graceful shutdown...`);

    server.close(async () => {
      console.log('HTTP server closed');
      try {
        await prisma.$disconnect();
        console.log('Database disconnected');
      } catch (error) {
        console.error('Error disconnecting database:', error);
      }
      console.log('Graceful shutdown complete');
      process.exit(0);
    });

    setTimeout(() => {
      console.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  process.on('uncaughtException', async (error) => {
    console.error('Uncaught exception:', error);
    await gracefulShutdown('uncaughtException');
  });

  process.on('unhandledRejection', async (reason) => {
    console.error('Unhandled rejection:', reason);
    await gracefulShutdown('unhandledRejection');
  });
}

startServer();

export default app;