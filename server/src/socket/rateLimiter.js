import { logger } from '../utils/logger.js';

/**
 * Socket rate limiter to prevent abuse
 * Limits the number of events a socket can emit within a time window
 */
class SocketRateLimiter {
  constructor() {
    this.limits = new Map();
    this.windowMs = 1000; // 1 second window
    this.maxRequests = 10; // Max 10 events per second per socket
    
    // Cleanup old entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  /**
   * Check if request is within rate limit
   * @param {string} socketId - Socket ID
   * @param {string} event - Event name
   * @returns {boolean} - True if within limit, false if exceeded
   */
  check(socketId, event) {
    const key = `${socketId}:${event}`;
    const now = Date.now();

    if (!this.limits.has(key)) {
      this.limits.set(key, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return true;
    }

    const limiter = this.limits.get(key);

    // Reset window if expired
    if (now > limiter.resetTime) {
      limiter.count = 1;
      limiter.resetTime = now + this.windowMs;
      return true;
    }

    // Check if limit exceeded
    if (limiter.count >= this.maxRequests) {
      logger.warn(`Rate limit exceeded for socket ${socketId} on event ${event}`);
      return false;
    }

    limiter.count++;
    return true;
  }

  /**
   * Cleanup expired entries
   */
  cleanup() {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, value] of this.limits.entries()) {
      if (now > value.resetTime + 60000) {
        this.limits.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.info(`Socket rate limiter: cleaned ${cleaned} expired entries`);
    }
  }

  /**
   * Create rate limiting middleware for socket events
   * @param {import('socket.io').Socket} socket - Socket instance
   * @param {string} event - Event name
   * @param {Function} handler - Original event handler
   * @returns {Function} - Wrapped handler with rate limiting
   */
  wrap(socket, event, handler) {
    return (...args) => {
      if (!this.check(socket.id, event)) {
        socket.emit('error:rateLimit', {
          message: 'Rate limit exceeded. Please slow down.',
          event,
          timestamp: new Date(),
        });
        return;
      }

      try {
        handler(...args);
      } catch (error) {
        logger.error(`Error in socket event ${event}:`, error);
        socket.emit('error:occurred', {
          message: 'An error occurred processing your request',
          event,
          timestamp: new Date(),
        });
      }
    };
  }

  /**
   * Cleanup on shutdown
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.limits.clear();
  }
}

// Singleton instance
const rateLimiter = new SocketRateLimiter();

export default rateLimiter;
export { SocketRateLimiter };
