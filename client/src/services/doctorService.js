import axiosInstance from './axiosInstance';

export const doctorService = {
  getAll: async (params = {}) => {
    const response = await axiosInstance.get('/doctors', { params });
    return response.data.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/doctors/${id}`);
    return response.data.data.doctor;
  },

  getBySpecialty: async (specialty) => {
    const response = await axiosInstance.get(`/doctors/specialty/${specialty}`);
    return response.data.data.doctors;
  },

  getByHospital: async (hospitalId) => {
    const response = await axiosInstance.get(`/doctors/hospital/${hospitalId}`);
    return response.data.data.doctors;
  },

  create: async (doctorData) => {
    const response = await axiosInstance.post('/doctors', doctorData);
    return response.data.data.doctor;
  },

  update: async (id, doctorData) => {
    const response = await axiosInstance.patch(`/doctors/${id}`, doctorData);
    return response.data.data.doctor;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/doctors/${id}`);
    return response.data;
  },
};
