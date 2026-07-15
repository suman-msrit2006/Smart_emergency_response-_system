import express from 'express';
import {
  createEmergencyRequest,
  getMyRequests,
  getActiveRequest,
  getPendingRequests,
  acceptRequest,
  rejectRequest,
  updateStatus,
  getActiveAssignment,
  getMyAmbulance,
  cancelRequest,
} from '../controllers/emergencyRequestController.js';

import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes - authentication required
router.use(protect);

// Patient routes
router.post('/', restrictTo('Patient'), createEmergencyRequest);
router.get('/my-requests', restrictTo('Patient'), getMyRequests);
router.get('/active', restrictTo('Patient'), getActiveRequest);

// Ambulance Personnel routes
router.get('/pending', restrictTo('Ambulance Personnel'), getPendingRequests);
router.get('/my-ambulance', restrictTo('Ambulance Personnel'), getMyAmbulance);
router.get('/assignment', restrictTo('Ambulance Personnel'), getActiveAssignment);
router.patch('/:id/accept', restrictTo('Ambulance Personnel'), acceptRequest);
router.patch('/:id/reject', restrictTo('Ambulance Personnel'), rejectRequest);
router.patch('/:id/status', restrictTo('Ambulance Personnel'), updateStatus);

// Shared route (must be after specific paths)
router.patch('/:id/cancel', restrictTo('Patient'), cancelRequest);

export default router;
