import morgan from 'morgan';
import config from '../config/env.js';

export const morganMiddleware = morgan(
  config.env === 'production' ? 'combined' : 'dev',
  {
    skip: (req, res) => {
      if (config.env === 'production') {
        return res.statusCode < 400;
      }
      return false;
    },
  }
);

export const logger = {
  info: (message) => {
    console.log(`ℹ️  [INFO] ${new Date().toISOString()}: ${message}`);
  },
  error: (message, error) => {
    console.error(`❌ [ERROR] ${new Date().toISOString()}: ${message}`);
    if (error) console.error(error);
  },
  warn: (message) => {
    console.warn(`⚠️  [WARN] ${new Date().toISOString()}: ${message}`);
  },
  success: (message) => {
    console.log(`✅ [SUCCESS] ${new Date().toISOString()}: ${message}`);
  },
};
