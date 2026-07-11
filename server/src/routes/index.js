import express from 'express';
import authRoutes from './authRoutes.js';
import hospitalRoutes from './hospitalRoutes.js';
import ambulanceRoutes from './ambulanceRoutes.js';
import emergencyRoutes from './emergencyRoutes.js';
import vitalRoutes from './vitalRoutes.js';
import consultationRoutes from './consultationRoutes.js';
import feedbackRoutes from './feedbackRoutes.js';
import doctorRoutes from './doctorRoutes.js';

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'TrackER AI API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

router.use('/auth', authRoutes);
router.use('/hospitals', hospitalRoutes);
router.use('/ambulances', ambulanceRoutes);
router.use('/emergencies', emergencyRoutes);
router.use('/vitals', vitalRoutes);
router.use('/consultations', consultationRoutes);
router.use('/feedbacks', feedbackRoutes);
router.use('/doctors', doctorRoutes);

export default router;
