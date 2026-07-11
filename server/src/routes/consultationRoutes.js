import express from 'express';
import {
  createConsultation,
  getAllConsultations,
  getConsultation,
  updateConsultation,
  deleteConsultation,
  startConsultation,
  completeConsultation,
  addPrescription,
  addLabTest,
  updateLabTest,
  getPatientConsultations,
  getDoctorConsultations,
} from '../controllers/consultationController.js';

import { protect, restrictTo } from '../middleware/auth.js';

import {
  createConsultationSchema,
  updateConsultationSchema,
  addPrescriptionSchema,
  addLabTestSchema,
  updateLabTestSchema,
} from '../validations/consultationValidation.js';

// ✅ Correct import
import { validateRequest } from '../validations/authValidation.js';

const router = express.Router();

router.get('/patient/:patientId', protect, getPatientConsultations);
router.get('/doctor/:doctorId', protect, getDoctorConsultations);

router
  .route('/')
  .get(protect, getAllConsultations)
  .post(
    protect,
    restrictTo('Doctor', 'Hospital Admin'),
    validateRequest(createConsultationSchema),
    createConsultation
  );

router
  .route('/:id')
  .get(protect, getConsultation)
  .patch(
    protect,
    restrictTo('Doctor'),
    validateRequest(updateConsultationSchema),
    updateConsultation
  )
  .delete(protect, restrictTo('Doctor', 'Hospital Admin'), deleteConsultation);

router.patch(
  '/:id/start',
  protect,
  restrictTo('Doctor'),
  startConsultation
);

router.patch(
  '/:id/complete',
  protect,
  restrictTo('Doctor'),
  completeConsultation
);

router.post(
  '/:id/prescriptions',
  protect,
  restrictTo('Doctor'),
  validateRequest(addPrescriptionSchema),
  addPrescription
);

router.post(
  '/:id/lab-tests',
  protect,
  restrictTo('Doctor'),
  validateRequest(addLabTestSchema),
  addLabTest
);

router.patch(
  '/:id/lab-tests/:labTestId',
  protect,
  restrictTo('Doctor', 'Hospital Admin'),
  validateRequest(updateLabTestSchema),
  updateLabTest
);

export default router;