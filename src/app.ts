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

/*
-----------------------------------------
CORS CONFIGURATION
-----------------------------------------
*/
const allowedOrigins = config.env.CORS_ORIGINS;

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // allow requests with no origin (curl, mobile apps, server-to-server)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.warn(`⛔ CORS blocked request from origin: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept'
  ],
  optionsSuccessStatus: 200
};

/*
-----------------------------------------
APPLY CORS FIRST
-----------------------------------------
*/
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

/*
-----------------------------------------
SECURITY MIDDLEWARE
-----------------------------------------
*/
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

console.log(`🌐 Allowed CORS origins: ${allowedOrigins.join(', ')}`);

/*
-----------------------------------------
BODY PARSING
-----------------------------------------
*/
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/*
-----------------------------------------
COMPRESSION
-----------------------------------------
*/
app.use(compression());

/*
-----------------------------------------
STATIC FILES
-----------------------------------------
*/
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

/*
-----------------------------------------
SWAGGER DOCUMENTATION
-----------------------------------------
*/
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Gym Management API Documentation'
  })
);

/*
-----------------------------------------
HEALTH CHECK
-----------------------------------------
*/
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

/*
-----------------------------------------
API ROUTES
-----------------------------------------
*/
app.use('/api', apiRoutes);

/*
-----------------------------------------
404 HANDLER
-----------------------------------------
*/
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

/*
-----------------------------------------
GLOBAL ERROR HANDLER
-----------------------------------------
*/
app.use(errorHandler);

export default app;