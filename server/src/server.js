import { createServer } from 'http';
import app from './app.js';
import config from './config/env.js';
import connectDB from './config/database.js';
import { initializeSocket } from './socket/index.js';
import { logger } from './utils/logger.js';
import { autoResetOnStartup } from './utils/devAutoReset.js';

process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...', err);
  process.exit(1);
});

const port = config.port;
const httpServer = createServer(app);

// Initialize Socket.IO with modular architecture
initializeSocket(httpServer);

// Connect to database and auto-reset in development, then start server
connectDB().then(async () => {
  // Auto-reset SOS workflow data on startup (development only)
  await autoResetOnStartup();
  
  // Start server after database connection and reset
  httpServer.listen(port, () => {
    logger.success(`Server running in ${config.env} mode on port ${port}`);
    logger.info(`API Health Check: http://localhost:${port}/api/health`);
    logger.info(`Socket.IO ready for real-time connections`);
    
    if (config.env === 'development') {
      logger.warn('⚠️  AUTO-RESET ENABLED: SOS data cleared on every server restart');
      logger.warn('⚠️  To disable: Set NODE_ENV=production in .env');
    }
  });
});

process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! Shutting down...', err);
  httpServer.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM RECEIVED. Shutting down gracefully...');
  httpServer.close(() => {
    logger.info('Process terminated');
  });
});
