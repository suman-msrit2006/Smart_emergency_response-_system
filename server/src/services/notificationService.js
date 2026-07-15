import Notification from '../models/Notification.js';
import { logger } from '../utils/logger.js';
import { getIO } from '../socket/index.js';

/**
 * Create a notification for a recipient
 */
export const createNotification = async ({
  recipientId,
  type = 'feedback',
  title,
  message,
  feedbackId = null,
  meta = {},
}) => {
  const notification = await Notification.create({
    recipient: recipientId,
    type,
    title,
    message,
    feedback: feedbackId,
    meta,
  });

  // Push real-time notification via Socket.IO
  try {
    const io = getIO();
    if (io) {
      io.to(`user_${recipientId.toString()}`).emit('notification:new', {
        notification: {
          _id: notification._id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          isRead: notification.isRead,
          meta: notification.meta,
          createdAt: notification.createdAt,
        },
      });
      logger.info(`Notification pushed to user ${recipientId}: ${title}`);
    }
  } catch (err) {
    logger.error('Socket emit failed for notification:', err);
  }

  return notification;
};

/**
 * Get all notifications for a user (most recent first)
 */
export const getUserNotifications = async (userId, { page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;

  const notifications = await Notification.find({ recipient: userId })
    .populate('feedback', 'rating comment title type createdAt')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Notification.countDocuments({ recipient: userId });
  const unreadCount = await Notification.countDocuments({ recipient: userId, isRead: false });

  return { notifications, total, unreadCount, page: parseInt(page), limit: parseInt(limit) };
};

/**
 * Get unread count only (for badge)
 */
export const getUnreadCount = async (userId) => {
  return Notification.countDocuments({ recipient: userId, isRead: false });
};

/**
 * Mark a single notification as read
 */
export const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { isRead: true },
    { new: true }
  );
  return notification;
};

/**
 * Mark all notifications as read for a user
 */
export const markAllAsRead = async (userId) => {
  const result = await Notification.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true }
  );
  return result;
};
