import express from 'express';
import compression from 'compression';
import {
  helmetConfig,
  corsConfig,
  limiter,
  mongoSanitizeConfig,
} from './middleware/security.js';
import { morganMiddleware } from './utils/logger.js';
import routes from './routes/index.js';
import errorHandler from './middleware/errorHandler.js';
import notFound from './middleware/notFound.js';
import config from './config/env.js';

const app = express();

// Security middleware
app.use(helmetConfig);
app.use(corsConfig);
app.use(mongoSanitizeConfig);

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(morganMiddleware);

// Rate limiting (production only)
if (config.env === 'production') {
  app.use('/api/', limiter);
}

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to TrackER AI API',
    version: '1.0.0',
    environment: config.env,
    documentation: '/api/health',
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env,
  });
});

// API routes
app.use('/api', routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
