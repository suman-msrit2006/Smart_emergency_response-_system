import EmergencyRequest from '../models/EmergencyRequest.js';
import Emergency from '../models/Emergency.js';
import Ambulance from '../models/Ambulance.js';
import Vital from '../models/Vital.js';
import Consultation from '../models/Consultation.js';
import Notification from '../models/Notification.js';
import Feedback from '../models/Feedback.js';
import { logger } from './logger.js';
import config from '../config/env.js';

/**
 * Auto-reset SOS workflow on server startup (Development Only)
 * Clears all emergency-related data for fresh testing
 */
export const autoResetOnStartup = async () => {
  // Only run in development mode
  if (config.env !== 'development') {
    return;
  }

  try {
    logger.warn('═══════════════════════════════════════════════════');
    logger.warn('  AUTO-RESET: Clearing SOS workflow data...');
    logger.warn('═══════════════════════════════════════════════════');

    const results = {};

    // 1. Clear emergency requests
    const deletedRequests = await EmergencyRequest.deleteMany({});
    results.emergencyRequests = deletedRequests.deletedCount;

    // 2. Clear emergencies
    const deletedEmergencies = await Emergency.deleteMany({});
    results.emergencies = deletedEmergencies.deletedCount;

    // 3. Reset ambulances
    const resetAmbulances = await Ambulance.updateMany(
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
    results.ambulances = resetAmbulances.modifiedCount;

    // 4. Clear vitals
    const deletedVitals = await Vital.deleteMany({});
    results.vitals = deletedVitals.deletedCount;

    // 5. Clear consultations
    const deletedConsultations = await Consultation.deleteMany({});
    results.consultations = deletedConsultations.deletedCount;

    // 6. Clear notifications
    const deletedNotifications = await Notification.deleteMany({});
    results.notifications = deletedNotifications.deletedCount;

    // 7. Clear feedback
    const deletedFeedback = await Feedback.deleteMany({});
    results.feedback = deletedFeedback.deletedCount;

    logger.success('✅ AUTO-RESET COMPLETE:');
    logger.info(`   - Emergency Requests: ${results.emergencyRequests} deleted`);
    logger.info(`   - Emergencies: ${results.emergencies} deleted`);
    logger.info(`   - Ambulances: ${results.ambulances} reset to Available`);
    logger.info(`   - Vitals: ${results.vitals} deleted`);
    logger.info(`   - Consultations: ${results.consultations} deleted`);
    logger.info(`   - Notifications: ${results.notifications} deleted`);
    logger.info(`   - Feedback: ${results.feedback} deleted`);
    logger.success('✅ System ready for fresh SOS testing!');
    logger.warn('═══════════════════════════════════════════════════');

  } catch (error) {
    logger.error('❌ AUTO-RESET FAILED:', error.message);
    logger.warn('Continuing with server startup...');
  }
};

export default autoResetOnStartup;
