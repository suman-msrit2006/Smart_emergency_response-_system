import express from 'express';
import {
  createHospital,
  getAllHospitals,
  getHospital,
  updateHospital,
  deleteHospital,
  updateCapacity,
  getNearbyHospitals,
  getHospitalsBySpecialty,
} from '../controllers/hospitalController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import {
  createHospitalSchema,
  updateHospitalSchema,
  updateCapacitySchema,
} from '../validations/hospitalValidation.js';

import { validateRequest } from '../validations/authValidation.js';

const router = express.Router();

router.get('/nearby', getNearbyHospitals);
router.get('/specialty/:specialty', getHospitalsBySpecialty);

router
  .route('/')
  .get(getAllHospitals)
  .post(
    protect,
    restrictTo('Hospital Admin'),
    validateRequest(createHospitalSchema),
    createHospital
  );

router
  .route('/:id')
  .get(getHospital)
  .patch(
    protect,
    restrictTo('Hospital Admin'),
    validateRequest(updateHospitalSchema),
    updateHospital
  )
  .delete(protect, restrictTo('Hospital Admin'), deleteHospital);

router.patch(
  '/:id/capacity',
  protect,
  restrictTo('Hospital Admin'),
  validateRequest(updateCapacitySchema),
  updateCapacity
);

export default router;
