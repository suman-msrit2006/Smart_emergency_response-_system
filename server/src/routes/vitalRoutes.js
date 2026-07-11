import express from 'express';
import {
  createVital,
  getAllVitals,
  getVital,
  updateVital,
  deleteVital,
  getPatientVitals,
  getLatestVital,
  getCriticalVitals,
  getVitalsByEmergency,
  getVitalsByConsultation,
} from '../controllers/vitalController.js';

import { protect, restrictTo } from '../middleware/auth.js';

import {
  createVitalSchema,
  updateVitalSchema,
} from '../validations/vitalValidation.js';

// ✅ Correct import
import { validateRequest } from '../validations/authValidation.js';

const router = express.Router();

router.get(
  '/critical',
  protect,
  restrictTo('Doctor', 'Hospital Admin'),
  getCriticalVitals
);

router.get('/patient/:patientId', protect, getPatientVitals);
router.get('/patient/:patientId/latest', protect, getLatestVital);
router.get('/emergency/:emergencyId', protect, getVitalsByEmergency);
router.get('/consultation/:consultationId', protect, getVitalsByConsultation);

router
  .route('/')
  .get(protect, getAllVitals)
  .post(
    protect,
    restrictTo('Doctor', 'Ambulance Driver', 'Hospital Admin'),
    validateRequest(createVitalSchema),
    createVital
  );

router
  .route('/:id')
  .get(protect, getVital)
  .patch(
    protect,
    restrictTo('Doctor', 'Ambulance Driver', 'Hospital Admin'),
    validateRequest(updateVitalSchema),
    updateVital
  )
  .delete(protect, restrictTo('Doctor', 'Hospital Admin'), deleteVital);

export default router;
