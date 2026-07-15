import axiosInstance from './axiosInstance';
import { API_ENDPOINTS } from '../config/api';

export const notificationService = {
  /**
   * Get all notifications for the current user
   */
  getAll: async ({ page = 1, limit = 20 } = {}) => {
    const response = await axiosInstance.get(API_ENDPOINTS.NOTIFICATIONS.BASE, {
      params: { page, limit },
    });
    return response.data.data;
  },

  /**
   * Get unread notification count (for bell badge)
   */
  getUnreadCount: async () => {
    const response = await axiosInstance.get(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
    return response.data.data.unreadCount;
  },

  /**
   * Mark a single notification as read
   */
  markAsRead: async (id) => {
    const response = await axiosInstance.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
    return response.data.data.notification;
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async () => {
    const response = await axiosInstance.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
    return response.data;
  },
};
