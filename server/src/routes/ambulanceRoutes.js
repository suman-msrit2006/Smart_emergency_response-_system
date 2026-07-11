import express from 'express';
import {
  createAmbulance,
  getAllAmbulances,
  getAmbulance,
  updateAmbulance,
  deleteAmbulance,
  updateLocation,
  updateStatus,
  updateFuel,
  getAvailableAmbulances,
} from '../controllers/ambulanceController.js';

import { protect, restrictTo } from '../middleware/auth.js';

import {
  createAmbulanceSchema,
  updateAmbulanceSchema,
  updateLocationSchema,
  updateStatusSchema,
  updateFuelSchema,
} from '../validations/ambulanceValidation.js';

// ✅ Correct import
import { validateRequest } from '../validations/authValidation.js';

const router = express.Router();

router.get('/available', getAvailableAmbulances);

router
  .route('/')
  .get(protect, getAllAmbulances)
  .post(
    protect,
    restrictTo('Hospital Admin'),
    validateRequest(createAmbulanceSchema),
    createAmbulance
  );

router
  .route('/:id')
  .get(protect, getAmbulance)
  .patch(
    protect,
    restrictTo('Hospital Admin', 'Ambulance Driver'),
    validateRequest(updateAmbulanceSchema),
    updateAmbulance
  )
  .delete(protect, restrictTo('Hospital Admin'), deleteAmbulance);

router.patch(
  '/:id/location',
  protect,
  restrictTo('Ambulance Driver'),
  validateRequest(updateLocationSchema),
  updateLocation
);

router.patch(
  '/:id/status',
  protect,
  restrictTo('Ambulance Driver', 'Hospital Admin'),
  validateRequest(updateStatusSchema),
  updateStatus
);

router.patch(
  '/:id/fuel',
  protect,
  restrictTo('Ambulance Driver'),
  validateRequest(updateFuelSchema),
  updateFuel
);

export default router;