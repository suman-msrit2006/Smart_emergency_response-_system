import axiosInstance from './axiosInstance';
import { API_ENDPOINTS } from '../config/api';

export const consultationService = {
  getAll: async (params = {}) => {
    const response = await axiosInstance.get(API_ENDPOINTS.CONSULTATIONS.BASE, { params });
    return response.data.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`${API_ENDPOINTS.CONSULTATIONS.BASE}/${id}`);
    return response.data.data.consultation;
  },

  create: async (consultationData) => {
    const response = await axiosInstance.post(API_ENDPOINTS.CONSULTATIONS.BASE, consultationData);
    return response.data.data.consultation;
  },

  update: async (id, consultationData) => {
    const response = await axiosInstance.patch(`${API_ENDPOINTS.CONSULTATIONS.BASE}/${id}`, consultationData);
    return response.data.data.consultation;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`${API_ENDPOINTS.CONSULTATIONS.BASE}/${id}`);
    return response.data;
  },

  start: async (id) => {
    const response = await axiosInstance.patch(API_ENDPOINTS.CONSULTATIONS.START(id));
    return response.data.data.consultation;
  },

  complete: async (id) => {
    const response = await axiosInstance.patch(API_ENDPOINTS.CONSULTATIONS.COMPLETE(id));
    return response.data.data.consultation;
  },

  addPrescription: async (id, prescriptionData) => {
    const response = await axiosInstance.post(API_ENDPOINTS.CONSULTATIONS.PRESCRIPTIONS(id), prescriptionData);
    return response.data.data.consultation;
  },

  addLabTest: async (id, labTestData) => {
    const response = await axiosInstance.post(API_ENDPOINTS.CONSULTATIONS.LAB_TESTS(id), labTestData);
    return response.data.data.consultation;
  },

  getPatientConsultations: async (patientId) => {
    const response = await axiosInstance.get(API_ENDPOINTS.CONSULTATIONS.PATIENT(patientId));
    return response.data.data.consultations;
  },

  getDoctorConsultations: async (doctorId, date) => {
    const response = await axiosInstance.get(API_ENDPOINTS.CONSULTATIONS.DOCTOR(doctorId), {
      params: { date },
    });
    return response.data.data.consultations;
  },
};
