export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    PROFILE: '/auth/profile',
  },
  HOSPITALS: {
    BASE: '/hospitals',
    NEARBY: '/hospitals/nearby',
    SPECIALTY: '/hospitals/specialty',
    CAPACITY: (id) => `/hospitals/${id}/capacity`,
  },
  AMBULANCES: {
    BASE: '/ambulances',
    AVAILABLE: '/ambulances/available',
    LOCATION: (id) => `/ambulances/${id}/location`,
    STATUS: (id) => `/ambulances/${id}/status`,
    FUEL: (id) => `/ambulances/${id}/fuel`,
  },
  EMERGENCIES: {
    BASE: '/emergencies',
    NEARBY: '/emergencies/nearby',
    PATIENT: (id) => `/emergencies/patient/${id}`,
    STATUS: (id) => `/emergencies/${id}/status`,
    ASSIGN_AMBULANCE: (id) => `/emergencies/${id}/assign-ambulance`,
    ASSIGN_HOSPITAL: (id) => `/emergencies/${id}/assign-hospital`,
  },
  VITALS: {
    BASE: '/vitals',
    PATIENT: (id) => `/vitals/patient/${id}`,
    LATEST: (id) => `/vitals/patient/${id}/latest`,
    CRITICAL: '/vitals/critical',
    EMERGENCY: (id) => `/vitals/emergency/${id}`,
    CONSULTATION: (id) => `/vitals/consultation/${id}`,
  },
  CONSULTATIONS: {
    BASE: '/consultations',
    PATIENT: (id) => `/consultations/patient/${id}`,
    DOCTOR: (id) => `/consultations/doctor/${id}`,
    START: (id) => `/consultations/${id}/start`,
    COMPLETE: (id) => `/consultations/${id}/complete`,
    PRESCRIPTIONS: (id) => `/consultations/${id}/prescriptions`,
    LAB_TESTS: (id) => `/consultations/${id}/lab-tests`,
  },
  FEEDBACKS: {
    BASE: '/feedbacks',
    HOSPITAL: (id) => `/feedbacks/hospital/${id}`,
    DOCTOR: (id) => `/feedbacks/doctor/${id}`,
    MY_FEEDBACKS: '/feedbacks/my-feedbacks',
    VOTE: (id) => `/feedbacks/${id}/vote`,
  },
  NOTIFICATIONS: {
    BASE: '/notifications',
    UNREAD_COUNT: '/notifications/unread-count',
    MARK_ALL_READ: '/notifications/mark-all-read',
    MARK_READ: (id) => `/notifications/${id}/read`,
  },
};
