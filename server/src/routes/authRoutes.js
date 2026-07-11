import express from 'express';
import { register, login, getProfile, updateProfile, updateSettings } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import {
  registerSchema,
  loginSchema,
  validateRequest,
} from '../validations/authValidation.js';
import { authLimiter } from '../middleware/security.js';

const router = express.Router();

router.post('/register', authLimiter, validateRequest(registerSchema), register);
router.post('/login', authLimiter, validateRequest(loginSchema), login);
router.get('/profile', protect, getProfile);
router.patch('/profile', protect, updateProfile);
router.patch('/settings', protect, updateSettings);

export default router;
