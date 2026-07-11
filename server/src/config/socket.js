import { Server } from 'socket.io';
import config from './env.js';
import { verifyToken } from '../utils/jwt.js';
import { logger } from '../utils/logger.js';

let io;

// Socket rate limiter - prevents abuse
const socketRateLimiter = new Map();

const checkRateLimit = (socketId, event) => {
  const key = `${socketId}:${event}`;
  const now = Date.now();
  const windowMs = 1000; // 1 second window
  const maxRequests = 10; // Max 10 events per second per socket

  if (!socketRateLimiter.has(key)) {
    socketRateLimiter.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  const limiter = socketRateLimiter.get(key);

  if (now > limiter.resetTime) {
    // Reset window
    limiter.count = 1;
    limiter.resetTime = now + windowMs;
    return true;
  }

  if (limiter.count >= maxRequests) {
    logger.warn(`Rate limit exceeded for socket ${socketId} on event ${event}`);
    return false;
  }

  limiter.count++;
  return true;
};

// Cleanup old rate limit entries every minute
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of socketRateLimiter.entries()) {
    if (now > value.resetTime + 60000) {
      socketRateLimiter.delete(key);
    }
  }
}, 60000);

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [config.clientUrl, 'http://localhost:5173', 'http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      logger.warn('Socket connection attempted without token');
      return next(new Error('Authentication token required'));
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      logger.warn('Socket connection attempted with invalid token');
      return next(new Error('Invalid token'));
    }

    socket.userId = decoded.id;
    socket.userRole = decoded.role;
    next();
  });

  io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id} (User: ${socket.userId})`);

    socket.on('join:ambulance', (ambulanceId) => {
      if (!checkRateLimit(socket.id, 'join:ambulance')) {
        socket.emit('error', { message: 'Rate limit exceeded. Please slow down.' });
        return;
      }
      socket.join(`ambulance:${ambulanceId}`);
      logger.info(`Socket ${socket.id} joined ambulance room: ${ambulanceId}`);
    });

    socket.on('join:emergency', (emergencyId) => {
      if (!checkRateLimit(socket.id, 'join:emergency')) {
        socket.emit('error', { message: 'Rate limit exceeded. Please slow down.' });
        return;
      }
      socket.join(`emergency:${emergencyId}`);
      logger.info(`Socket ${socket.id} joined emergency room: ${emergencyId}`);
    });

    socket.on('join:hospital', (hospitalId) => {
      if (!checkRateLimit(socket.id, 'join:hospital')) {
        socket.emit('error', { message: 'Rate limit exceeded. Please slow down.' });
        return;
      }
      socket.join(`hospital:${hospitalId}`);
      logger.info(`Socket ${socket.id} joined hospital room: ${hospitalId}`);
    });

    socket.on('join:patient', (patientId) => {
      if (!checkRateLimit(socket.id, 'join:patient')) {
        socket.emit('error', { message: 'Rate limit exceeded. Please slow down.' });
        return;
      }
      socket.join(`patient:${patientId}`);
      logger.info(`Socket ${socket.id} joined patient room: ${patientId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });

    socket.on('error', (error) => {
      logger.error('Socket error:', error);
    });
  });

  logger.success('Socket.IO initialized successfully');

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

export const emitAmbulanceLocationUpdate = (ambulanceId, location) => {
  if (!io) return;
  
  io.to(`ambulance:${ambulanceId}`).emit('ambulance:locationUpdate', {
    ambulanceId,
    location,
    timestamp: new Date(),
  });

  logger.info(`Ambulance location updated: ${ambulanceId}`);
};

export const emitEmergencyStatusChanged = (emergency) => {
  if (!io) return;

  io.to(`emergency:${emergency._id}`).emit('emergency:statusChanged', {
    emergencyId: emergency._id,
    status: emergency.status,
    emergency,
    timestamp: new Date(),
  });

  if (emergency.patient) {
    io.to(`patient:${emergency.patient}`).emit('emergency:statusChanged', {
      emergencyId: emergency._id,
      status: emergency.status,
      emergency,
      timestamp: new Date(),
    });
  }

  logger.info(`Emergency status changed: ${emergency._id} -> ${emergency.status}`);
};

export const emitNewVitals = (vital) => {
  if (!io) return;

  if (vital.patient) {
    io.to(`patient:${vital.patient}`).emit('vitals:new', {
      vitalId: vital._id,
      vital,
      timestamp: new Date(),
    });
  }

  if (vital.emergency) {
    io.to(`emergency:${vital.emergency}`).emit('vitals:new', {
      vitalId: vital._id,
      vital,
      timestamp: new Date(),
    });
  }

  logger.info(`New vitals recorded: ${vital._id} for patient: ${vital.patient}`);
};

export const emitVitalsUpdate = (vital) => {
  if (!io) return;

  if (vital.patient) {
    io.to(`patient:${vital.patient}`).emit('vitals:updated', {
      vitalId: vital._id,
      vital,
      timestamp: new Date(),
    });
  }

  logger.info(`Vitals updated: ${vital._id}`);
};

export const emitEmergencyCreated = (emergency) => {
  if (!io) return;

  io.emit('emergency:created', {
    emergencyId: emergency._id,
    emergency,
    timestamp: new Date(),
  });

  logger.info(`New emergency created: ${emergency._id}`);
};

export const emitAmbulanceAssigned = (emergency, ambulance) => {
  if (!io) return;

  io.to(`emergency:${emergency._id}`).emit('ambulance:assigned', {
    emergencyId: emergency._id,
    ambulanceId: ambulance._id,
    ambulance,
    timestamp: new Date(),
  });

  io.to(`ambulance:${ambulance._id}`).emit('emergency:assigned', {
    emergencyId: emergency._id,
    emergency,
    timestamp: new Date(),
  });

  logger.info(`Ambulance ${ambulance._id} assigned to emergency ${emergency._id}`);
};
