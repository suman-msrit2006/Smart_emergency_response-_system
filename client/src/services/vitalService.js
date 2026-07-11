import axiosInstance from './axiosInstance';
import { API_ENDPOINTS } from '../config/api';

export const vitalService = {
  getAll: async (params = {}) => {
    const response = await axiosInstance.get(API_ENDPOINTS.VITALS.BASE, { params });
    return response.data.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`${API_ENDPOINTS.VITALS.BASE}/${id}`);
    return response.data.data.vital;
  },

  create: async (vitalData) => {
    const response = await axiosInstance.post(API_ENDPOINTS.VITALS.BASE, vitalData);
    return response.data.data.vital;
  },

  update: async (id, vitalData) => {
    const response = await axiosInstance.patch(`${API_ENDPOINTS.VITALS.BASE}/${id}`, vitalData);
    return response.data.data.vital;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`${API_ENDPOINTS.VITALS.BASE}/${id}`);
    return response.data;
  },

  getPatientVitals: async (patientId, limit) => {
    const response = await axiosInstance.get(API_ENDPOINTS.VITALS.PATIENT(patientId), {
      params: { limit },
    });
    return response.data.data.vitals;
  },

  getLatestVital: async (patientId) => {
    const response = await axiosInstance.get(API_ENDPOINTS.VITALS.LATEST(patientId));
    return response.data.data.vital;
  },

  getCriticalVitals: async () => {
    const response = await axiosInstance.get(API_ENDPOINTS.VITALS.CRITICAL);
    return response.data.data.vitals;
  },

  getByEmergency: async (emergencyId) => {
    const response = await axiosInstance.get(API_ENDPOINTS.VITALS.EMERGENCY(emergencyId));
    return response.data.data.vitals;
  },

  getByConsultation: async (consultationId) => {
    const response = await axiosInstance.get(API_ENDPOINTS.VITALS.CONSULTATION(consultationId));
    return response.data.data.vitals;
  },
};
