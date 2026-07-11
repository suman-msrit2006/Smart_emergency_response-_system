import axiosInstance from './axiosInstance';
import { API_ENDPOINTS } from '../config/api';

export const hospitalService = {
  getAll: async (params = {}) => {
    const response = await axiosInstance.get(API_ENDPOINTS.HOSPITALS.BASE, { params });
    return response.data.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`${API_ENDPOINTS.HOSPITALS.BASE}/${id}`);
    return response.data.data.hospital;
  },

  create: async (hospitalData) => {
    const response = await axiosInstance.post(API_ENDPOINTS.HOSPITALS.BASE, hospitalData);
    return response.data.data.hospital;
  },

  update: async (id, hospitalData) => {
    const response = await axiosInstance.patch(`${API_ENDPOINTS.HOSPITALS.BASE}/${id}`, hospitalData);
    return response.data.data.hospital;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`${API_ENDPOINTS.HOSPITALS.BASE}/${id}`);
    return response.data;
  },

  updateCapacity: async (id, capacityData) => {
    const response = await axiosInstance.patch(API_ENDPOINTS.HOSPITALS.CAPACITY(id), capacityData);
    return response.data.data.hospital;
  },

  getNearby: async (longitude, latitude, maxDistance) => {
    const response = await axiosInstance.get(API_ENDPOINTS.HOSPITALS.NEARBY, {
      params: { longitude, latitude, maxDistance },
    });
    return response.data.data.hospitals;
  },

  getBySpecialty: async (specialty) => {
    const response = await axiosInstance.get(`${API_ENDPOINTS.HOSPITALS.SPECIALTY}/${specialty}`);
    return response.data.data.hospitals;
  },
};
