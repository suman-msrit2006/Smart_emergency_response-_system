import { createServer } from 'http';
import app from './app.js';
import config from './config/env.js';
import connectDB from './config/database.js';
import { initializeSocket } from './socket/index.js';
import { logger } from './utils/logger.js';

process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...', err);
  process.exit(1);
});

connectDB();

const port = config.port;
const httpServer = createServer(app);

// Initialize Socket.IO with modular architecture
initializeSocket(httpServer);

httpServer.listen(port, () => {
  logger.success(`Server running in ${config.env} mode on port ${port}`);
  logger.info(`API Health Check: http://localhost:${port}/api/health`);
  logger.info(`Socket.IO ready for real-time connections`);
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
