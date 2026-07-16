import EmergencyRequest from '../models/EmergencyRequest.js';
import Emergency from '../models/Emergency.js';
import Ambulance from '../models/Ambulance.js';
import Vital from '../models/Vital.js';
import Consultation from '../models/Consultation.js';
import Notification from '../models/Notification.js';
import Feedback from '../models/Feedback.js';
import { logger } from '../utils/logger.js';
import catchAsync from '../utils/catchAsync.js';

/**
 * Reset SOS workflow data for fresh testing
 * DEVELOPMENT ONLY - DO NOT USE IN PRODUCTION
 * 
 * This endpoint clears all emergency-related data while preserving:
 * - User accounts (patients, ambulance personnel, doctors)
 * - Hospitals
 * - Ambulance vehicle data (but resets their status)
 * - Authentication tokens
 */
export const resetSOSWorkflow = catchAsync(async (req, res) => {
  logger.info('=== STARTING SOS WORKFLOW RESET (DEV ONLY) ===');

  const resetSummary = {
    emergencyRequests: { deleted: 0 },
    emergencies: { deleted: 0 },
    ambulances: { reset: 0 },
    vitals: { deleted: 0 },
    consultations: { deleted: 0 },
    notifications: { deleted: 0 },
    feedback: { deleted: 0 },
  };

  try {
    // 1. DELETE ALL EMERGENCY REQUESTS
    logger.info('Step 1: Deleting all emergency requests...');
    const deletedRequests = await EmergencyRequest.deleteMany({});
    resetSummary.emergencyRequests.deleted = deletedRequests.deletedCount;
    logger.info(`Deleted ${deletedRequests.deletedCount} emergency requests`);

    // 2. DELETE ALL EMERGENCIES
    logger.info('Step 2: Deleting all emergencies...');
    const deletedEmergencies = await Emergency.deleteMany({});
    resetSummary.emergencies.deleted = deletedEmergencies.deletedCount;
    logger.info(`Deleted ${deletedEmergencies.deletedCount} emergencies`);

    // 3. RESET ALL AMBULANCES TO AVAILABLE & ONLINE
    logger.info('Step 3: Resetting all ambulances to Available and Online...');
    const ambulanceUpdate = await Ambulance.updateMany(
      {},
      {
        $set: {
          status: 'Available',
          isOnline: true,
          currentEmergency: null,
          currentRequest: null,
          isActive: true,
        },
      }
    );
    resetSummary.ambulances.reset = ambulanceUpdate.modifiedCount;
    logger.info(`Reset ${ambulanceUpdate.modifiedCount} ambulances`);

    // 4. DELETE ALL VITALS
    logger.info('Step 4: Deleting all vital records...');
    const deletedVitals = await Vital.deleteMany({});
    resetSummary.vitals.deleted = deletedVitals.deletedCount;
    logger.info(`Deleted ${deletedVitals.deletedCount} vital records`);

    // 5. DELETE ALL CONSULTATIONS
    logger.info('Step 5: Deleting all consultations...');
    const deletedConsultations = await Consultation.deleteMany({});
    resetSummary.consultations.deleted = deletedConsultations.deletedCount;
    logger.info(`Deleted ${deletedConsultations.deletedCount} consultations`);

    // 6. DELETE ALL NOTIFICATIONS
    logger.info('Step 6: Deleting all notifications...');
    const deletedNotifications = await Notification.deleteMany({});
    resetSummary.notifications.deleted = deletedNotifications.deletedCount;
    logger.info(`Deleted ${deletedNotifications.deletedCount} notifications`);

    // 7. DELETE ALL FEEDBACK
    logger.info('Step 7: Deleting all feedback...');
    const deletedFeedback = await Feedback.deleteMany({});
    resetSummary.feedback.deleted = deletedFeedback.deletedCount;
    logger.info(`Deleted ${deletedFeedback.deletedCount} feedback records`);

    // 8. CLEAR SOCKET.IO STATE (handled automatically by disconnections)
    logger.info('Step 8: Socket.IO state will be cleared on client reconnection');

    logger.info('=== SOS WORKFLOW RESET COMPLETE ===');
    logger.info('Reset Summary:', JSON.stringify(resetSummary, null, 2));

    res.status(200).json({
      status: 'success',
      message: 'SOS workflow reset successfully. System is ready for fresh testing.',
      data: {
        summary: resetSummary,
        preserved: {
          users: 'All user accounts preserved',
          hospitals: 'All hospital data preserved',
          ambulanceVehicles: 'Ambulance vehicle data preserved (status reset)',
          authentication: 'All login tokens still valid',
        },
        note: 'You can now start a fresh SOS test workflow without "active request" errors.',
      },
    });

  } catch (error) {
    logger.error('=== SOS WORKFLOW RESET FAILED ===');
    logger.error('Error:', error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to reset SOS workflow',
      error: error.message,
      partialReset: resetSummary,
    });
  }
});

/**
 * Get current system state for verification
 */
export const getSystemState = catchAsync(async (req, res) => {
  const state = {
    emergencyRequests: {
      total: await EmergencyRequest.countDocuments(),
      active: await EmergencyRequest.countDocuments({ isActive: true }),
      pending: await EmergencyRequest.countDocuments({ status: 'PENDING' }),
      completed: await EmergencyRequest.countDocuments({ status: 'COMPLETED' }),
    },
    emergencies: {
      total: await Emergency.countDocuments(),
      active: await Emergency.countDocuments({ isActive: true }),
    },
    ambulances: {
      total: await Ambulance.countDocuments(),
      available: await Ambulance.countDocuments({ status: 'Available' }),
      online: await Ambulance.countDocuments({ isOnline: true }),
      busy: await Ambulance.countDocuments({ 
        status: { $in: ['En Route', 'On Scene', 'Transporting'] } 
      }),
    },
    vitals: {
      total: await Vital.countDocuments(),
    },
    consultations: {
      total: await Consultation.countDocuments(),
    },
    notifications: {
      total: await Notification.countDocuments(),
      unread: await Notification.countDocuments({ isRead: false }),
    },
    feedback: {
      total: await Feedback.countDocuments(),
    },
  };

  res.status(200).json({
    status: 'success',
    data: { state },
  });
});

export default {
  resetSOSWorkflow,
  getSystemState,
};
