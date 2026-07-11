import axiosInstance from './axiosInstance';
import { API_ENDPOINTS } from '../config/api';

export const feedbackService = {
  getAll: async (params = {}) => {
    const response = await axiosInstance.get(API_ENDPOINTS.FEEDBACKS.BASE, { params });
    return response.data.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`${API_ENDPOINTS.FEEDBACKS.BASE}/${id}`);
    return response.data.data.feedback;
  },

  create: async (feedbackData) => {
    const response = await axiosInstance.post(API_ENDPOINTS.FEEDBACKS.BASE, feedbackData);
    return response.data.data.feedback;
  },

  update: async (id, feedbackData) => {
    const response = await axiosInstance.patch(`${API_ENDPOINTS.FEEDBACKS.BASE}/${id}`, feedbackData);
    return response.data.data.feedback;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`${API_ENDPOINTS.FEEDBACKS.BASE}/${id}`);
    return response.data;
  },

  vote: async (id, vote) => {
    const response = await axiosInstance.post(API_ENDPOINTS.FEEDBACKS.VOTE(id), { vote });
    return response.data.data.feedback;
  },

  getHospitalFeedbacks: async (hospitalId) => {
    const response = await axiosInstance.get(API_ENDPOINTS.FEEDBACKS.HOSPITAL(hospitalId));
    return response.data.data;
  },

  getDoctorFeedbacks: async (doctorId) => {
    const response = await axiosInstance.get(API_ENDPOINTS.FEEDBACKS.DOCTOR(doctorId));
    return response.data.data;
  },

  getMyFeedbacks: async () => {
    const response = await axiosInstance.get(API_ENDPOINTS.FEEDBACKS.MY_FEEDBACKS);
    return response.data.data.feedbacks;
  },
};
