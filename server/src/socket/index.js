import { Server } from 'socket.io';
import config from '../config/env.js';
import { verifyToken } from '../utils/jwt.js';
import { logger } from '../utils/logger.js';
import { setupAmbulanceSocket } from './ambulance.socket.js';
import { setupEmergencySocket } from './emergency.socket.js';
import { setupVitalsSocket } from './vitals.socket.js';
import rateLimiter from './rateLimiter.js';

let io;

/**
 * Initialize Socket.IO server with authentication and room management
 * @param {import('http').Server} server - HTTP server instance
 * @returns {Server} Socket.IO server instance
 */
export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        config.clientUrl,
        'http://localhost:5173',
        'http://localhost:3000',
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        logger.warn(`Socket connection attempted without token: ${socket.id}`);
        return next(new Error('Authentication token required'));
      }

      const decoded = verifyToken(token);

      if (!decoded) {
        logger.warn(`Socket connection attempted with invalid token: ${socket.id}`);
        return next(new Error('Invalid or expired token'));
      }

      // Attach user info to socket
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      socket.userEmail = decoded.email;

      logger.info(`Socket authenticated: ${socket.id} (User: ${socket.userId}, Role: ${socket.userRole})`);
      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    logger.success(`Client connected: ${socket.id} (User: ${socket.userId}, Role: ${socket.userRole})`);

    // Emit connection success
    socket.emit('connection:success', {
      message: 'Connected to TrackER AI real-time server',
      socketId: socket.id,
      userId: socket.userId,
      role: socket.userRole,
      timestamp: new Date(),
    });

    // Auto-join user-specific room for targeted notifications
    if (socket.userId) {
      socket.join(`user_${socket.userId}`);
    }

    // Setup domain-specific socket handlers
    setupAmbulanceSocket(io, socket);
    setupEmergencySocket(io, socket);
    setupVitalsSocket(io, socket);

    // Global room management
    socket.on('join:room', rateLimiter.wrap(socket, 'join:room', (roomName) => {
      try {
        socket.join(roomName);
        logger.info(`Socket ${socket.id} joined room: ${roomName}`);
        socket.emit('room:joined', { room: roomName, timestamp: new Date() });
      } catch (error) {
        logger.error(`Error joining room ${roomName}:`, error);
        socket.emit('room:error', { message: 'Failed to join room', room: roomName });
      }
    }));

    socket.on('leave:room', rateLimiter.wrap(socket, 'leave:room', (roomName) => {
      try {
        socket.leave(roomName);
        logger.info(`Socket ${socket.id} left room: ${roomName}`);
        socket.emit('room:left', { room: roomName, timestamp: new Date() });
      } catch (error) {
        logger.error(`Error leaving room ${roomName}:`, error);
        socket.emit('room:error', { message: 'Failed to leave room', room: roomName });
      }
    }));

    // Heartbeat/ping handler
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: new Date() });
    });

    // Disconnect handler
    socket.on('disconnect', (reason) => {
      logger.info(`Client disconnected: ${socket.id} (User: ${socket.userId}, Reason: ${reason})`);
    });

    // Error handler
    socket.on('error', (error) => {
      logger.error(`Socket error for ${socket.id}:`, error);
      socket.emit('error:occurred', {
        message: 'An error occurred',
        timestamp: new Date(),
      });
    });

    // Handle connection errors
    socket.on('connect_error', (error) => {
      logger.error(`Connection error for ${socket.id}:`, error);
    });
  });

  logger.success('Socket.IO initialized successfully with modular architecture');
  return io;
};

/**
 * Get Socket.IO instance
 * @returns {Server} Socket.IO server instance
 * @throws {Error} If Socket.IO not initialized
 */
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initializeSocket() first.');
  }
  return io;
};

/**
 * Emit event to specific room
 * @param {string} room - Room name
 * @param {string} event - Event name
 * @param {any} data - Event data
 */
export const emitToRoom = (room, event, data) => {
  try {
    if (!io) {
      logger.warn('Attempted to emit event before Socket.IO initialization');
      return;
    }
    io.to(room).emit(event, data);
    logger.debug(`Emitted ${event} to room ${room}`);
  } catch (error) {
    logger.error(`Error emitting to room ${room}:`, error);
  }
};

/**
 * Emit event to specific user
 * @param {string} userId - User ID
 * @param {string} event - Event name
 * @param {any} data - Event data
 */
export const emitToUser = (userId, event, data) => {
  try {
    if (!io) {
      logger.warn('Attempted to emit event before Socket.IO initialization');
      return;
    }
    io.to(`user:${userId}`).emit(event, data);
    logger.debug(`Emitted ${event} to user ${userId}`);
  } catch (error) {
    logger.error(`Error emitting to user ${userId}:`, error);
  }
};

/**
 * Broadcast event to all connected clients
 * @param {string} event - Event name
 * @param {any} data - Event data
 */
export const broadcast = (event, data) => {
  try {
    if (!io) {
      logger.warn('Attempted to broadcast before Socket.IO initialization');
      return;
    }
    io.emit(event, data);
    logger.debug(`Broadcasted ${event} to all clients`);
  } catch (error) {
    logger.error('Error broadcasting event:', error);
  }
};

/**
 * Get number of connected clients
 * @returns {Promise<number>} Number of connected clients
 */
export const getConnectedClientsCount = async () => {
  if (!io) return 0;
  const sockets = await io.fetchSockets();
  return sockets.length;
};

/**
 * Get all rooms
 * @returns {Set<string>} Set of room names
 */
export const getAllRooms = () => {
  if (!io) return new Set();
  return io.sockets.adapter.rooms;
};

export default {
  initializeSocket,
  getIO,
  emitToRoom,
  emitToUser,
  broadcast,
  getConnectedClientsCount,
  getAllRooms,
};
