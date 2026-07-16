import express from 'express';
import { resetSOSWorkflow, getSystemState } from '../controllers/devResetController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

/**
 * DEVELOPMENT ONLY ROUTES
 * These routes should be disabled in production
 */

// Get current system state (public for dev convenience)
router.get('/state', getSystemState);

// Reset SOS workflow (requires authentication for safety)
router.post('/reset-sos', protect, resetSOSWorkflow);

export default router;
