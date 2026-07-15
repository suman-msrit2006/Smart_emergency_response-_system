import axiosInstance from './axiosInstance';
import { API_ENDPOINTS } from '../config/api';

export const ambulanceService = {
  getAll: async (params = {}) => {
    const response = await axiosInstance.get(API_ENDPOINTS.AMBULANCES.BASE, { params });
    return response.data.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`${API_ENDPOINTS.AMBULANCES.BASE}/${id}`);
    return response.data.data.ambulance;
  },

  create: async (ambulanceData) => {
    const response = await axiosInstance.post(API_ENDPOINTS.AMBULANCES.BASE, ambulanceData);
    return response.data.data.ambulance;
  },

  update: async (id, ambulanceData) => {
    const response = await axiosInstance.patch(`${API_ENDPOINTS.AMBULANCES.BASE}/${id}`, ambulanceData);
    return response.data.data.ambulance;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`${API_ENDPOINTS.AMBULANCES.BASE}/${id}`);
    return response.data;
  },

  updateLocation: async (id, coordinates) => {
    const response = await axiosInstance.patch(API_ENDPOINTS.AMBULANCES.LOCATION(id), {
      coordinates,
    });
    return response.data.data.ambulance;
  },

  updateStatus: async (id, status) => {
    const response = await axiosInstance.patch(API_ENDPOINTS.AMBULANCES.STATUS(id), {
      status,
    });
    return response.data.data.ambulance;
  },

  updateFuel: async (id, fuelLevel) => {
    const response = await axiosInstance.patch(API_ENDPOINTS.AMBULANCES.FUEL(id), {
      fuelLevel,
    });
    return response.data.data.ambulance;
  },

  getAvailable: async (longitude, latitude, maxDistance) => {
    const response = await axiosInstance.get(API_ENDPOINTS.AMBULANCES.AVAILABLE, {
      params: { longitude, latitude, maxDistance },
    });
    return response.data.data.ambulances;
  },

  updateOnlineStatus: async (id, isOnline) => {
    const response = await axiosInstance.patch(`${API_ENDPOINTS.AMBULANCES.BASE}/${id}/online-status`, {
      isOnline,
    });
    return response.data.data.ambulance;
  },
};
