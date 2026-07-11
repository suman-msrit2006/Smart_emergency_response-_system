import axiosInstance from './axiosInstance';
import { API_ENDPOINTS } from '../config/api';

export const emergencyService = {
  getAll: async (params = {}) => {
    const response = await axiosInstance.get(API_ENDPOINTS.EMERGENCIES.BASE, { params });
    return response.data.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`${API_ENDPOINTS.EMERGENCIES.BASE}/${id}`);
    return response.data.data.emergency;
  },

  create: async (emergencyData) => {
    const response = await axiosInstance.post(API_ENDPOINTS.EMERGENCIES.BASE, emergencyData);
    return response.data.data.emergency;
  },

  update: async (id, emergencyData) => {
    const response = await axiosInstance.patch(`${API_ENDPOINTS.EMERGENCIES.BASE}/${id}`, emergencyData);
    return response.data.data.emergency;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`${API_ENDPOINTS.EMERGENCIES.BASE}/${id}`);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await axiosInstance.patch(API_ENDPOINTS.EMERGENCIES.STATUS(id), { status });
    return response.data.data.emergency;
  },

  assignAmbulance: async (id, ambulanceId, estimatedArrival) => {
    const response = await axiosInstance.patch(API_ENDPOINTS.EMERGENCIES.ASSIGN_AMBULANCE(id), {
      ambulanceId,
      estimatedArrival,
    });
    return response.data.data.emergency;
  },

  assignHospital: async (id, hospitalId) => {
    const response = await axiosInstance.patch(API_ENDPOINTS.EMERGENCIES.ASSIGN_HOSPITAL(id), {
      hospitalId,
    });
    return response.data.data.emergency;
  },

  getNearby: async (longitude, latitude, maxDistance) => {
    const response = await axiosInstance.get(API_ENDPOINTS.EMERGENCIES.NEARBY, {
      params: { longitude, latitude, maxDistance },
    });
    return response.data.data.emergencies;
  },

  getPatientEmergencies: async (patientId) => {
    const response = await axiosInstance.get(API_ENDPOINTS.EMERGENCIES.PATIENT(patientId));
    return response.data.data.emergencies;
  },
};
