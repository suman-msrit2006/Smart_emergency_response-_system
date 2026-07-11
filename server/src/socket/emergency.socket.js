import { logger } from '../utils/logger.js';

/**
 * Setup emergency-related socket events
 * @param {import('socket.io').Server} io - Socket.IO server instance
 * @param {import('socket.io').Socket} socket - Socket instance
 */
export const setupEmergencySocket = (io, socket) => {
  // Join emergency room
  socket.on('emergency:join', (emergencyId) => {
    try {
      const roomName = `emergency:${emergencyId}`;
      socket.join(roomName);
      logger.info(`Socket ${socket.id} joined emergency room: ${emergencyId}`);
      
      socket.emit('emergency:joined', {
        emergencyId,
        room: roomName,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Error joining emergency room:', error);
      socket.emit('emergency:error', {
        message: 'Failed to join emergency room',
        error: error.message,
      });
    }
  });

  // Leave emergency room
  socket.on('emergency:leave', (emergencyId) => {
    try {
      const roomName = `emergency:${emergencyId}`;
      socket.leave(roomName);
      logger.info(`Socket ${socket.id} left emergency room: ${emergencyId}`);
      
      socket.emit('emergency:left', {
        emergencyId,
        room: roomName,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Error leaving emergency room:', error);
      socket.emit('emergency:error', {
        message: 'Failed to leave emergency room',
        error: error.message,
      });
    }
  });

  // Join patient emergency room (for patient to track their emergencies)
  socket.on('emergency:joinPatient', (patientId) => {
    try {
      const roomName = `patient:${patientId}:emergencies`;
      socket.join(roomName);
      logger.info(`Socket ${socket.id} joined patient emergency room: ${patientId}`);
      
      socket.emit('emergency:patientJoined', {
        patientId,
        room: roomName,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Error joining patient emergency room:', error);
      socket.emit('emergency:error', {
        message: 'Failed to join patient emergency room',
        error: error.message,
      });
    }
  });

  // Join hospital emergency room (for hospital to see incoming emergencies)
  socket.on('emergency:joinHospital', (hospitalId) => {
    try {
      const roomName = `hospital:${hospitalId}:emergencies`;
      socket.join(roomName);
      logger.info(`Socket ${socket.id} joined hospital emergency room: ${hospitalId}`);
      
      socket.emit('emergency:hospitalJoined', {
        hospitalId,
        room: roomName,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Error joining hospital emergency room:', error);
      socket.emit('emergency:error', {
        message: 'Failed to join hospital emergency room',
        error: error.message,
      });
    }
  });

  // Update emergency status in real-time
  socket.on('emergency:updateStatus', (data) => {
    try {
      const { emergencyId, status, notes } = data;

      if (!emergencyId || !status) {
        socket.emit('emergency:error', {
          message: 'emergencyId and status are required',
        });
        return;
      }

      const statusData = {
        emergencyId,
        status,
        notes: notes || null,
        timestamp: new Date(),
        updatedBy: socket.userId,
      };

      // Emit to all tracking this emergency
      io.to(`emergency:${emergencyId}`).emit('emergency:statusUpdate', statusData);

      logger.info(`Emergency status updated: ${emergencyId} -> ${status}`);

      socket.emit('emergency:statusUpdated', {
        success: true,
        emergencyId,
        status,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Error updating emergency status:', error);
      socket.emit('emergency:error', {
        message: 'Failed to update status',
        error: error.message,
      });
    }
  });

  // Update emergency location (if patient moves)
  socket.on('emergency:updateLocation', (data) => {
    try {
      const { emergencyId, coordinates } = data;

      if (!emergencyId || !coordinates) {
        socket.emit('emergency:error', {
          message: 'emergencyId and coordinates are required',
        });
        return;
      }

      if (!Array.isArray(coordinates) || coordinates.length !== 2) {
        socket.emit('emergency:error', {
          message: 'Invalid coordinates format. Expected [longitude, latitude]',
        });
        return;
      }

      const locationData = {
        emergencyId,
        location: {
          type: 'Point',
          coordinates,
        },
        timestamp: new Date(),
        updatedBy: socket.userId,
      };

      // Emit to all tracking this emergency
      io.to(`emergency:${emergencyId}`).emit('emergency:locationUpdate', locationData);

      logger.info(`Emergency location updated: ${emergencyId} at [${coordinates[0]}, ${coordinates[1]}]`);

      socket.emit('emergency:locationUpdated', {
        success: true,
        emergencyId,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Error updating emergency location:', error);
      socket.emit('emergency:error', {
        message: 'Failed to update location',
        error: error.message,
      });
    }
  });

  // Send emergency message/note
  socket.on('emergency:sendMessage', (data) => {
    try {
      const { emergencyId, message, messageType } = data;

      if (!emergencyId || !message) {
        socket.emit('emergency:error', {
          message: 'emergencyId and message are required',
        });
        return;
      }

      const messageData = {
        emergencyId,
        message,
        messageType: messageType || 'info',
        sender: {
          id: socket.userId,
          role: socket.userRole,
        },
        timestamp: new Date(),
      };

      // Emit to all in the emergency room
      io.to(`emergency:${emergencyId}`).emit('emergency:message', messageData);

      logger.info(`Emergency message sent for ${emergencyId}`);

      socket.emit('emergency:messageSent', {
        success: true,
        emergencyId,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Error sending emergency message:', error);
      socket.emit('emergency:error', {
        message: 'Failed to send message',
        error: error.message,
      });
    }
  });

  // Track multiple emergencies (for dispatch/admin)
  socket.on('emergency:trackMultiple', (emergencyIds) => {
    try {
      if (!Array.isArray(emergencyIds)) {
        socket.emit('emergency:error', {
          message: 'emergencyIds must be an array',
        });
        return;
      }

      emergencyIds.forEach((id) => {
        socket.join(`emergency:${id}`);
      });

      logger.info(`Socket ${socket.id} now tracking ${emergencyIds.length} emergencies`);

      socket.emit('emergency:trackingMultiple', {
        emergencyIds,
        count: emergencyIds.length,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Error tracking multiple emergencies:', error);
      socket.emit('emergency:error', {
        message: 'Failed to track emergencies',
        error: error.message,
      });
    }
  });

  // Request ETA update
  socket.on('emergency:requestETA', (emergencyId) => {
    try {
      // Emit request to ambulance drivers tracking this emergency
      io.to(`emergency:${emergencyId}`).emit('emergency:etaRequested', {
        emergencyId,
        requestedBy: socket.userId,
        timestamp: new Date(),
      });

      logger.info(`ETA requested for emergency: ${emergencyId}`);
    } catch (error) {
      logger.error('Error requesting ETA:', error);
      socket.emit('emergency:error', {
        message: 'Failed to request ETA',
        error: error.message,
      });
    }
  });

  // Update ETA from ambulance
  socket.on('emergency:updateETA', (data) => {
    try {
      const { emergencyId, eta, distance } = data;

      if (!emergencyId || !eta) {
        socket.emit('emergency:error', {
          message: 'emergencyId and eta are required',
        });
        return;
      }

      const etaData = {
        emergencyId,
        eta,
        distance: distance || null,
        timestamp: new Date(),
        updatedBy: socket.userId,
      };

      io.to(`emergency:${emergencyId}`).emit('emergency:etaUpdate', etaData);

      logger.info(`ETA updated for emergency ${emergencyId}: ${eta} minutes`);

      socket.emit('emergency:etaUpdated', {
        success: true,
        emergencyId,
        eta,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Error updating ETA:', error);
      socket.emit('emergency:error', {
        message: 'Failed to update ETA',
        error: error.message,
      });
    }
  });
};

/**
 * Emit emergency status change to all tracking clients
 * @param {import('socket.io').Server} io - Socket.IO instance
 * @param {Object} emergency - Emergency object
 */
export const emitEmergencyStatusChanged = (io, emergency) => {
  try {
    if (!io) {
      logger.warn('Socket.IO not initialized');
      return;
    }

    const payload = {
      emergencyId: emergency._id,
      status: emergency.status,
      emergency,
      timestamp: new Date(),
    };

    // Emit to emergency room
    io.to(`emergency:${emergency._id}`).emit('emergency:statusChanged', payload);

    // Emit to patient room
    if (emergency.patient) {
      io.to(`patient:${emergency.patient}:emergencies`).emit('emergency:statusChanged', payload);
    }

    // Emit to hospital room
    if (emergency.assignedHospital) {
      io.to(`hospital:${emergency.assignedHospital}:emergencies`).emit('emergency:statusChanged', payload);
    }

    logger.info(`Emergency status broadcasted: ${emergency._id} -> ${emergency.status}`);
  } catch (error) {
    logger.error('Error emitting emergency status:', error);
  }
};

/**
 * Emit new emergency created
 * @param {import('socket.io').Server} io - Socket.IO instance
 * @param {Object} emergency - Emergency object
 */
export const emitEmergencyCreated = (io, emergency) => {
  try {
    if (!io) {
      logger.warn('Socket.IO not initialized');
      return;
    }

    const payload = {
      emergencyId: emergency._id,
      emergency,
      timestamp: new Date(),
    };

    // Broadcast to all connected clients (dispatch, ambulances, hospitals)
    io.emit('emergency:created', payload);

    // Emit to patient room
    if (emergency.patient) {
      io.to(`patient:${emergency.patient}:emergencies`).emit('emergency:created', payload);
    }

    logger.success(`New emergency broadcasted: ${emergency._id}`);
  } catch (error) {
    logger.error('Error emitting emergency created:', error);
  }
};

/**
 * Emit emergency assigned to hospital
 * @param {import('socket.io').Server} io - Socket.IO instance
 * @param {Object} emergency - Emergency object
 * @param {Object} hospital - Hospital object
 */
export const emitEmergencyAssignedToHospital = (io, emergency, hospital) => {
  try {
    if (!io) {
      logger.warn('Socket.IO not initialized');
      return;
    }

    const payload = {
      emergencyId: emergency._id,
      hospitalId: hospital._id,
      hospital,
      emergency,
      timestamp: new Date(),
    };

    io.to(`emergency:${emergency._id}`).emit('emergency:hospitalAssigned', payload);
    io.to(`hospital:${hospital._id}:emergencies`).emit('emergency:incoming', payload);

    logger.info(`Emergency ${emergency._id} assigned to hospital ${hospital._id}`);
  } catch (error) {
    logger.error('Error emitting hospital assignment:', error);
  }
};

/**
 * Emit emergency cancelled
 * @param {import('socket.io').Server} io - Socket.IO instance
 * @param {string} emergencyId - Emergency ID
 * @param {string} reason - Cancellation reason
 */
export const emitEmergencyCancelled = (io, emergencyId, reason) => {
  try {
    if (!io) {
      logger.warn('Socket.IO not initialized');
      return;
    }

    const payload = {
      emergencyId,
      reason: reason || 'Cancelled by user',
      timestamp: new Date(),
    };

    io.to(`emergency:${emergencyId}`).emit('emergency:cancelled', payload);

    logger.info(`Emergency cancelled: ${emergencyId}`);
  } catch (error) {
    logger.error('Error emitting emergency cancellation:', error);
  }
};

export default {
  setupEmergencySocket,
  emitEmergencyStatusChanged,
  emitEmergencyCreated,
  emitEmergencyAssignedToHospital,
  emitEmergencyCancelled,
};
