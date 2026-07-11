import express from 'express';
import {
  createEmergency,
  getAllEmergencies,
  getEmergency,
  updateEmergency,
  updateStatus,
  assignAmbulance,
  assignHospital,
  getNearbyEmergencies,
  getPatientEmergencies,
  deleteEmergency,
} from '../controllers/emergencyController.js';

import { protect, restrictTo } from '../middleware/auth.js';

import {
  createEmergencySchema,
  updateEmergencySchema,
  updateStatusSchema,
  assignAmbulanceSchema,
  assignHospitalSchema,
} from '../validations/emergencyValidation.js';

// ✅ Correct import
import { validateRequest } from '../validations/authValidation.js';

const router = express.Router();

router.get('/nearby', protect, getNearbyEmergencies);
router.get('/patient/:patientId', protect, getPatientEmergencies);

router
  .route('/')
  .get(protect, getAllEmergencies)
  .post(protect, validateRequest(createEmergencySchema), createEmergency);

router
  .route('/:id')
  .get(protect, getEmergency)
  .patch(
    protect,
    restrictTo('Hospital Admin', 'Ambulance Driver', 'Doctor'),
    validateRequest(updateEmergencySchema),
    updateEmergency
  )
  .delete(protect, deleteEmergency);

router.patch(
  '/:id/status',
  protect,
  restrictTo('Hospital Admin', 'Ambulance Driver'),
  validateRequest(updateStatusSchema),
  updateStatus
);

router.patch(
  '/:id/assign-ambulance',
  protect,
  restrictTo('Hospital Admin'),
  validateRequest(assignAmbulanceSchema),
  assignAmbulance
);

router.patch(
  '/:id/assign-hospital',
  protect,
  restrictTo('Hospital Admin', 'Ambulance Driver'),
  validateRequest(assignHospitalSchema),
  assignHospital
);

export default router;
