import { logger } from '../utils/logger.js';
import rateLimiter from './rateLimiter.js';

/**
 * Setup ambulance-related socket events
 * @param {import('socket.io').Server} io - Socket.IO server instance
 * @param {import('socket.io').Socket} socket - Socket instance
 */
export const setupAmbulanceSocket = (io, socket) => {
  // Join ambulance room
  socket.on('ambulance:join', (ambulanceId) => {
    try {
      const roomName = `ambulance:${ambulanceId}`;
      socket.join(roomName);
      logger.info(`Socket ${socket.id} joined ambulance room: ${ambulanceId}`);
      
      socket.emit('ambulance:joined', {
        ambulanceId,
        room: roomName,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error(`Error joining ambulance room:`, error);
      socket.emit('ambulance:error', {
        message: 'Failed to join ambulance room',
        error: error.message,
      });
    }
  });

  // Leave ambulance room
  socket.on('ambulance:leave', (ambulanceId) => {
    try {
      const roomName = `ambulance:${ambulanceId}`;
      socket.leave(roomName);
      logger.info(`Socket ${socket.id} left ambulance room: ${ambulanceId}`);
      
      socket.emit('ambulance:left', {
        ambulanceId,
        room: roomName,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error(`Error leaving ambulance room:`, error);
      socket.emit('ambulance:error', {
        message: 'Failed to leave ambulance room',
        error: error.message,
      });
    }
  });

  // Real-time location update from ambulance
  socket.on('ambulance:updateLocation', rateLimiter.wrap(socket, 'ambulance:updateLocation', (data) => {
    try {
      const { ambulanceId, coordinates, speed, heading } = data;

      if (!ambulanceId || !coordinates) {
        socket.emit('ambulance:error', {
          message: 'ambulanceId and coordinates are required',
        });
        return;
      }

      // Validate coordinates
      if (!Array.isArray(coordinates) || coordinates.length !== 2) {
        socket.emit('ambulance:error', {
          message: 'Invalid coordinates format. Expected [longitude, latitude]',
        });
        return;
      }

      const locationData = {
        ambulanceId,
        location: {
          type: 'Point',
          coordinates,
        },
        speed: speed || null,
        heading: heading || null,
        timestamp: new Date(),
        updatedBy: socket.userId,
      };

      // Emit to all clients tracking this ambulance
      io.to(`ambulance:${ambulanceId}`).emit('ambulance:locationUpdate', locationData);
      
      // Emit to associated emergency if exists
      if (data.emergencyId) {
        io.to(`emergency:${data.emergencyId}`).emit('ambulance:locationUpdate', locationData);
      }

      logger.info(`Ambulance location updated: ${ambulanceId} at [${coordinates[0]}, ${coordinates[1]}]`);

      // Acknowledge to sender
      socket.emit('ambulance:locationUpdated', {
        success: true,
        ambulanceId,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Error updating ambulance location:', error);
      socket.emit('ambulance:error', {
        message: 'Failed to update location',
        error: error.message,
      });
    }
  }));

  // Ambulance status update
  socket.on('ambulance:updateStatus', (data) => {
    try {
      const { ambulanceId, status } = data;

      if (!ambulanceId || !status) {
        socket.emit('ambulance:error', {
          message: 'ambulanceId and status are required',
        });
        return;
      }

      const statusData = {
        ambulanceId,
        status,
        timestamp: new Date(),
        updatedBy: socket.userId,
      };

      // Emit to all tracking this ambulance
      io.to(`ambulance:${ambulanceId}`).emit('ambulance:statusUpdate', statusData);

      logger.info(`Ambulance status updated: ${ambulanceId} -> ${status}`);

      socket.emit('ambulance:statusUpdated', {
        success: true,
        ambulanceId,
        status,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Error updating ambulance status:', error);
      socket.emit('ambulance:error', {
        message: 'Failed to update status',
        error: error.message,
      });
    }
  });

  // Get real-time ambulance info
  socket.on('ambulance:getInfo', async (ambulanceId) => {
    try {
      // This would query the database for current ambulance info
      // For now, acknowledge the request
      socket.emit('ambulance:info', {
        ambulanceId,
        message: 'Join the ambulance room to receive real-time updates',
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Error getting ambulance info:', error);
      socket.emit('ambulance:error', {
        message: 'Failed to get ambulance info',
        error: error.message,
      });
    }
  });

  // Track multiple ambulances
  socket.on('ambulance:trackMultiple', (ambulanceIds) => {
    try {
      if (!Array.isArray(ambulanceIds)) {
        socket.emit('ambulance:error', {
          message: 'ambulanceIds must be an array',
        });
        return;
      }

      ambulanceIds.forEach((id) => {
        socket.join(`ambulance:${id}`);
      });

      logger.info(`Socket ${socket.id} now tracking ${ambulanceIds.length} ambulances`);

      socket.emit('ambulance:trackingMultiple', {
        ambulanceIds,
        count: ambulanceIds.length,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Error tracking multiple ambulances:', error);
      socket.emit('ambulance:error', {
        message: 'Failed to track ambulances',
        error: error.message,
      });
    }
  });

  // Stop tracking ambulance
  socket.on('ambulance:stopTracking', (ambulanceId) => {
    try {
      socket.leave(`ambulance:${ambulanceId}`);
      logger.info(`Socket ${socket.id} stopped tracking ambulance: ${ambulanceId}`);
      
      socket.emit('ambulance:trackingStopped', {
        ambulanceId,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Error stopping ambulance tracking:', error);
      socket.emit('ambulance:error', {
        message: 'Failed to stop tracking',
        error: error.message,
      });
    }
  });
};

/**
 * Emit ambulance location update to all tracking clients
 * @param {import('socket.io').Server} io - Socket.IO instance
 * @param {string} ambulanceId - Ambulance ID
 * @param {Object} locationData - Location data
 */
export const emitAmbulanceLocationUpdate = (io, ambulanceId, locationData) => {
  try {
    if (!io) {
      logger.warn('Socket.IO not initialized');
      return;
    }

    const payload = {
      ambulanceId,
      location: locationData.location,
      speed: locationData.speed || null,
      heading: locationData.heading || null,
      timestamp: new Date(),
    };

    io.to(`ambulance:${ambulanceId}`).emit('ambulance:locationUpdate', payload);
    logger.info(`Ambulance location broadcasted: ${ambulanceId}`);
  } catch (error) {
    logger.error('Error emitting ambulance location:', error);
  }
};

/**
 * Emit ambulance status change
 * @param {import('socket.io').Server} io - Socket.IO instance
 * @param {Object} ambulance - Ambulance object
 */
export const emitAmbulanceStatusChange = (io, ambulance) => {
  try {
    if (!io) {
      logger.warn('Socket.IO not initialized');
      return;
    }

    const payload = {
      ambulanceId: ambulance._id,
      status: ambulance.status,
      ambulance,
      timestamp: new Date(),
    };

    io.to(`ambulance:${ambulance._id}`).emit('ambulance:statusUpdate', payload);
    logger.info(`Ambulance status broadcasted: ${ambulance._id} -> ${ambulance.status}`);
  } catch (error) {
    logger.error('Error emitting ambulance status:', error);
  }
};

/**
 * Emit ambulance assignment to emergency
 * @param {import('socket.io').Server} io - Socket.IO instance
 * @param {string} ambulanceId - Ambulance ID
 * @param {string} emergencyId - Emergency ID
 * @param {Object} emergency - Emergency object
 */
export const emitAmbulanceAssignment = (io, ambulanceId, emergencyId, emergency) => {
  try {
    if (!io) {
      logger.warn('Socket.IO not initialized');
      return;
    }

    const payload = {
      ambulanceId,
      emergencyId,
      emergency,
      timestamp: new Date(),
    };

    io.to(`ambulance:${ambulanceId}`).emit('ambulance:assigned', payload);
    io.to(`emergency:${emergencyId}`).emit('ambulance:assigned', payload);
    
    logger.info(`Ambulance ${ambulanceId} assigned to emergency ${emergencyId}`);
  } catch (error) {
    logger.error('Error emitting ambulance assignment:', error);
  }
};

export default {
  setupAmbulanceSocket,
  emitAmbulanceLocationUpdate,
  emitAmbulanceStatusChange,
  emitAmbulanceAssignment,
};
