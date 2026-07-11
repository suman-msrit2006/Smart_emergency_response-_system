import express from 'express';
import {
  createFeedback,
  getAllFeedbacks,
  getFeedback,
  updateFeedback,
  deleteFeedback,
  voteFeedback,
  getHospitalFeedbacks,
  getDoctorFeedbacks,
  getUserFeedbacks,
} from '../controllers/feedbackController.js';

import { protect, restrictTo } from '../middleware/auth.js';

import {
  createFeedbackSchema,
  updateFeedbackSchema,
  voteSchema,
} from '../validations/feedbackValidation.js';

// ✅ Correct import
import { validateRequest } from '../validations/authValidation.js';

const router = express.Router();

router.get('/hospital/:hospitalId', getHospitalFeedbacks);
router.get('/doctor/:doctorId', getDoctorFeedbacks);
router.get('/my-feedbacks', protect, getUserFeedbacks);

router
  .route('/')
  .get(getAllFeedbacks)
  .post(protect, validateRequest(createFeedbackSchema), createFeedback);

router
  .route('/:id')
  .get(getFeedback)
  .patch(
    protect,
    restrictTo('Hospital Admin'),
    validateRequest(updateFeedbackSchema),
    updateFeedback
  )
  .delete(protect, deleteFeedback);

router.post('/:id/vote', validateRequest(voteSchema), voteFeedback);

export default router;
