import { logger } from '../utils/logger.js';

/**
 * Setup vitals-related socket events
 * @param {import('socket.io').Server} io - Socket.IO server instance
 * @param {import('socket.io').Socket} socket - Socket instance
 */
export const setupVitalsSocket = (io, socket) => {
  // Join patient vitals room
  socket.on('vitals:joinPatient', (patientId) => {
    try {
      const roomName = `patient:${patientId}:vitals`;
      socket.join(roomName);
      logger.info(`Socket ${socket.id} joined patient vitals room: ${patientId}`);
      
      socket.emit('vitals:patientJoined', {
        patientId,
        room: roomName,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Error joining patient vitals room:', error);
      socket.emit('vitals:error', {
        message: 'Failed to join patient vitals room',
        error: error.message,
      });
    }
  });

  // Join emergency vitals room
  socket.on('vitals:joinEmergency', (emergencyId) => {
    try {
      const roomName = `emergency:${emergencyId}:vitals`;
      socket.join(roomName);
      logger.info(`Socket ${socket.id} joined emergency vitals room: ${emergencyId}`);
      
      socket.emit('vitals:emergencyJoined', {
        emergencyId,
        room: roomName,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Error joining emergency vitals room:', error);
      socket.emit('vitals:error', {
        message: 'Failed to join emergency vitals room',
        error: error.message,
      });
    }
  });

  // Join consultation vitals room
  socket.on('vitals:joinConsultation', (consultationId) => {
    try {
      const roomName = `consultation:${consultationId}:vitals`;
      socket.join(roomName);
      logger.info(`Socket ${socket.id} joined consultation vitals room: ${consultationId}`);
      
      socket.emit('vitals:consultationJoined', {
        consultationId,
        room: roomName,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Error joining consultation vitals room:', error);
      socket.emit('vitals:error', {
        message: 'Failed to join consultation vitals room',
        error: error.message,
      });
    }
  });

  // Leave patient vitals room
  socket.on('vitals:leavePatient', (patientId) => {
    try {
      const roomName = `patient:${patientId}:vitals`;
      socket.leave(roomName);
      logger.info(`Socket ${socket.id} left patient vitals room: ${patientId}`);
      
      socket.emit('vitals:patientLeft', {
        patientId,
        room: roomName,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Error leaving patient vitals room:', error);
      socket.emit('vitals:error', {
        message: 'Failed to leave patient vitals room',
        error: error.message,
      });
    }
  });

  // Stream vital signs in real-time
  socket.on('vitals:stream', (data) => {
    try {
      const {
        patientId,
        emergencyId,
        consultationId,
        heartRate,
        bloodPressure,
        oxygenSaturation,
        temperature,
        respiratoryRate,
        glucoseLevel,
        notes,
      } = data;

      if (!patientId) {
        socket.emit('vitals:error', {
          message: 'patientId is required',
        });
        return;
      }

      const vitalData = {
        patientId,
        emergencyId: emergencyId || null,
        consultationId: consultationId || null,
        vitals: {
          heartRate: heartRate || null,
          bloodPressure: bloodPressure || null,
          oxygenSaturation: oxygenSaturation || null,
          temperature: temperature || null,
          respiratoryRate: respiratoryRate || null,
          glucoseLevel: glucoseLevel || null,
        },
        notes: notes || null,
        timestamp: new Date(),
        recordedBy: socket.userId,
      };

      // Emit to patient vitals room
      io.to(`patient:${patientId}:vitals`).emit('vitals:streamed', vitalData);

      // Emit to emergency vitals room if associated
      if (emergencyId) {
        io.to(`emergency:${emergencyId}:vitals`).emit('vitals:streamed', vitalData);
        io.to(`emergency:${emergencyId}`).emit('vitals:streamed', vitalData);
      }

      // Emit to consultation vitals room if associated
      if (consultationId) {
        io.to(`consultation:${consultationId}:vitals`).emit('vitals:streamed', vitalData);
      }

      logger.debug(`Vitals streamed for patient: ${patientId}`);

      socket.emit('vitals:streamedSuccess', {
        success: true,
        patientId,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Error streaming vitals:', error);
      socket.emit('vitals:error', {
        message: 'Failed to stream vitals',
        error: error.message,
      });
    }
  });

  // Request latest vitals
  socket.on('vitals:requestLatest', (patientId) => {
    try {
      if (!patientId) {
        socket.emit('vitals:error', {
          message: 'patientId is required',
        });
        return;
      }

      // Emit request to the patient vitals room
      io.to(`patient:${patientId}:vitals`).emit('vitals:latestRequested', {
        patientId,
        requestedBy: socket.userId,
        timestamp: new Date(),
      });

      logger.info(`Latest vitals requested for patient: ${patientId}`);
    } catch (error) {
      logger.error('Error requesting latest vitals:', error);
      socket.emit('vitals:error', {
        message: 'Failed to request latest vitals',
        error: error.message,
      });
    }
  });

  // Alert for critical vitals
  socket.on('vitals:alertCritical', (data) => {
    try {
      const { patientId, emergencyId, vitalType, value, severity } = data;

      if (!patientId || !vitalType) {
        socket.emit('vitals:error', {
          message: 'patientId and vitalType are required',
        });
        return;
      }

      const alertData = {
        patientId,
        emergencyId: emergencyId || null,
        vitalType,
        value: value || null,
        severity: severity || 'critical',
        timestamp: new Date(),
        alertedBy: socket.userId,
      };

      // Broadcast critical alert
      io.to(`patient:${patientId}:vitals`).emit('vitals:criticalAlert', alertData);

      if (emergencyId) {
        io.to(`emergency:${emergencyId}`).emit('vitals:criticalAlert', alertData);
        io.to(`emergency:${emergencyId}:vitals`).emit('vitals:criticalAlert', alertData);
      }

      // Also emit to all medical staff (would need a medical staff room)
      io.emit('vitals:globalCriticalAlert', alertData);

      logger.warn(`Critical vital alert for patient ${patientId}: ${vitalType} = ${value}`);

      socket.emit('vitals:alertSent', {
        success: true,
        patientId,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Error sending critical vitals alert:', error);
      socket.emit('vitals:error', {
        message: 'Failed to send critical alert',
        error: error.message,
      });
    }
  });

  // Monitor multiple patients (for doctors/nurses)
  socket.on('vitals:monitorMultiple', (patientIds) => {
    try {
      if (!Array.isArray(patientIds)) {
        socket.emit('vitals:error', {
          message: 'patientIds must be an array',
        });
        return;
      }

      patientIds.forEach((id) => {
        socket.join(`patient:${id}:vitals`);
      });

      logger.info(`Socket ${socket.id} now monitoring vitals for ${patientIds.length} patients`);

      socket.emit('vitals:monitoringMultiple', {
        patientIds,
        count: patientIds.length,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Error monitoring multiple patients:', error);
      socket.emit('vitals:error', {
        message: 'Failed to monitor patients',
        error: error.message,
      });
    }
  });

  // Stop monitoring patient
  socket.on('vitals:stopMonitoring', (patientId) => {
    try {
      socket.leave(`patient:${patientId}:vitals`);
      logger.info(`Socket ${socket.id} stopped monitoring patient: ${patientId}`);
      
      socket.emit('vitals:monitoringStopped', {
        patientId,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Error stopping vitals monitoring:', error);
      socket.emit('vitals:error', {
        message: 'Failed to stop monitoring',
        error: error.message,
      });
    }
  });
};

/**
 * Emit new vitals to all tracking clients
 * @param {import('socket.io').Server} io - Socket.IO instance
 * @param {Object} vital - Vital object
 */
export const emitNewVitals = (io, vital) => {
  try {
    if (!io) {
      logger.warn('Socket.IO not initialized');
      return;
    }

    const payload = {
      vitalId: vital._id,
      patientId: vital.patient,
      emergencyId: vital.emergency || null,
      consultationId: vital.consultation || null,
      vital,
      timestamp: new Date(),
    };

    // Emit to patient vitals room
    if (vital.patient) {
      io.to(`patient:${vital.patient}:vitals`).emit('vitals:new', payload);
    }

    // Emit to emergency room
    if (vital.emergency) {
      io.to(`emergency:${vital.emergency}`).emit('vitals:new', payload);
      io.to(`emergency:${vital.emergency}:vitals`).emit('vitals:new', payload);
    }

    // Emit to consultation room
    if (vital.consultation) {
      io.to(`consultation:${vital.consultation}:vitals`).emit('vitals:new', payload);
    }

    logger.info(`New vitals broadcasted: ${vital._id} for patient ${vital.patient}`);
  } catch (error) {
    logger.error('Error emitting new vitals:', error);
  }
};

/**
 * Emit vitals update
 * @param {import('socket.io').Server} io - Socket.IO instance
 * @param {Object} vital - Updated vital object
 */
export const emitVitalsUpdate = (io, vital) => {
  try {
    if (!io) {
      logger.warn('Socket.IO not initialized');
      return;
    }

    const payload = {
      vitalId: vital._id,
      patientId: vital.patient,
      vital,
      timestamp: new Date(),
    };

    // Emit to patient vitals room
    if (vital.patient) {
      io.to(`patient:${vital.patient}:vitals`).emit('vitals:updated', payload);
    }

    // Emit to emergency room
    if (vital.emergency) {
      io.to(`emergency:${vital.emergency}:vitals`).emit('vitals:updated', payload);
    }

    logger.info(`Vitals update broadcasted: ${vital._id}`);
  } catch (error) {
    logger.error('Error emitting vitals update:', error);
  }
};

/**
 * Emit critical vitals alert
 * @param {import('socket.io').Server} io - Socket.IO instance
 * @param {Object} vital - Vital object with critical values
 */
export const emitCriticalVitalsAlert = (io, vital) => {
  try {
    if (!io) {
      logger.warn('Socket.IO not initialized');
      return;
    }

    const payload = {
      vitalId: vital._id,
      patientId: vital.patient,
      emergencyId: vital.emergency || null,
      vital,
      severity: 'critical',
      timestamp: new Date(),
    };

    // Emit to patient room
    if (vital.patient) {
      io.to(`patient:${vital.patient}:vitals`).emit('vitals:criticalAlert', payload);
    }

    // Emit to emergency room
    if (vital.emergency) {
      io.to(`emergency:${vital.emergency}`).emit('vitals:criticalAlert', payload);
    }

    // Global broadcast to all medical staff
    io.emit('vitals:globalCriticalAlert', payload);

    logger.warn(`Critical vitals alert broadcasted for patient ${vital.patient}`);
  } catch (error) {
    logger.error('Error emitting critical vitals alert:', error);
  }
};

/**
 * Check if vitals are critical and need alerting
 * @param {Object} vital - Vital object
 * @returns {boolean} True if vitals are critical
 */
export const isVitalCritical = (vital) => {
  const criticalConditions = [];

  // Heart rate critical ranges
  if (vital.heartRate) {
    if (vital.heartRate < 40 || vital.heartRate > 140) {
      criticalConditions.push('heartRate');
    }
  }

  // Blood pressure critical ranges (systolic)
  if (vital.bloodPressure?.systolic) {
    if (vital.bloodPressure.systolic < 70 || vital.bloodPressure.systolic > 180) {
      criticalConditions.push('bloodPressure');
    }
  }

  // Oxygen saturation critical range
  if (vital.oxygenSaturation) {
    if (vital.oxygenSaturation < 90) {
      criticalConditions.push('oxygenSaturation');
    }
  }

  // Temperature critical ranges
  if (vital.temperature) {
    if (vital.temperature < 35 || vital.temperature > 40) {
      criticalConditions.push('temperature');
    }
  }

  // Respiratory rate critical ranges
  if (vital.respiratoryRate) {
    if (vital.respiratoryRate < 10 || vital.respiratoryRate > 30) {
      criticalConditions.push('respiratoryRate');
    }
  }

  return criticalConditions.length > 0;
};

export default {
  setupVitalsSocket,
  emitNewVitals,
  emitVitalsUpdate,
  emitCriticalVitalsAlert,
  isVitalCritical,
};
