import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { config, swaggerSpec } from './config';
import { errorHandler } from './common/middleware';
import apiRoutes from './api';

const app: Application = express();

// CORS configuration - MUST be before helmet and other middleware
const corsOptions: cors.CorsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    if (config.env.CORS_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⛔ CORS blocked request from origin: ${origin}`);
      callback(new Error(`CORS policy: Origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
};

// Handle preflight OPTIONS requests first
app.options('*', cors(corsOptions));

// Apply CORS to all routes
app.use(cors(corsOptions));

// Security middleware (after CORS so preflight headers aren't stripped)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// Log allowed CORS origins on startup
console.log(`🌐 CORS origins: ${config.env.CORS_ORIGINS.join(', ')}`);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Static file serving for uploads (gym logos, etc.)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Gym Management API Documentation',
}));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api', apiRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global error handler
app.use(errorHandler);

export default app;
