import express from 'express';
import {
  getAllDoctors,
  getDoctorById,
  getDoctorsBySpecialty,
  getDoctorsByHospital,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} from '../controllers/doctorController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.get('/specialty/:specialty', getDoctorsBySpecialty);
router.get('/hospital/:hospitalId', getDoctorsByHospital);

router
  .route('/')
  .get(getAllDoctors)
  .post(protect, restrictTo('Hospital Admin'), createDoctor);

router
  .route('/:id')
  .get(getDoctorById)
  .patch(protect, restrictTo('Doctor', 'Hospital Admin'), updateDoctor)
  .delete(protect, restrictTo('Hospital Admin'), deleteDoctor);

export default router;
