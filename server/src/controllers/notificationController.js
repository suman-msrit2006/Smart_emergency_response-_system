import * as notificationService from '../services/notificationService.js';
import catchAsync from '../utils/catchAsync.js';

/**
 * GET /api/notifications
 * Get all notifications for the authenticated user
 */
export const getMyNotifications = catchAsync(async (req, res) => {
  const { page, limit } = req.query;
  const result = await notificationService.getUserNotifications(req.user._id, { page, limit });

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

/**
 * GET /api/notifications/unread-count
 * Get unread notification count (for bell badge)
 */
export const getUnreadCount = catchAsync(async (req, res) => {
  const count = await notificationService.getUnreadCount(req.user._id);

  res.status(200).json({
    status: 'success',
    data: { unreadCount: count },
  });
});

/**
 * PATCH /api/notifications/:id/read
 * Mark a single notification as read
 */
export const markAsRead = catchAsync(async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.id, req.user._id);

  res.status(200).json({
    status: 'success',
    message: 'Notification marked as read',
    data: { notification },
  });
});

/**
 * PATCH /api/notifications/mark-all-read
 * Mark all notifications as read
 */
export const markAllAsRead = catchAsync(async (req, res) => {
  await notificationService.markAllAsRead(req.user._id);

  res.status(200).json({
    status: 'success',
    message: 'All notifications marked as read',
  });
});
