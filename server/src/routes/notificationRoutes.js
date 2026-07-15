import express from 'express';
import {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/', getMyNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/mark-all-read', markAllAsRead);
router.patch('/:id/read', markAsRead);

export default router;
