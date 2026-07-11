import axiosInstance from './axiosInstance';
import { API_ENDPOINTS } from '../config/api';

export const authService = {
  register: async (userData) => {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.REGISTER, userData);
    if (response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    if (response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getProfile: async () => {
    const response = await axiosInstance.get(API_ENDPOINTS.AUTH.PROFILE);
    return response.data.data.user;
  },

  updateProfile: async (profileData) => {
    const response = await axiosInstance.patch(API_ENDPOINTS.AUTH.PROFILE, profileData);
    if (response.data.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data.data.user;
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};
