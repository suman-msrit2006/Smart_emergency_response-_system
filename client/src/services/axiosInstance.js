import axios from 'axios';
import axiosRetry from 'axios-retry';
import { API_BASE_URL } from '../config/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Configure retry logic with exponential backoff
axiosRetry(axiosInstance, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    // Retry on network errors or 5xx server errors
    return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
           (error.response?.status >= 500 && error.response?.status < 600) ||
           error.response?.status === 429; // Retry on rate limit
  },
  shouldResetTimeout: true,
  onRetry: () => {
    // Retry attempt - silent in production
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }

      return Promise.reject({
        message: error.response.data?.message || 'An error occurred',
        status: error.response.status,
        errors: error.response.data?.errors || [],
      });
    }

    if (error.request) {
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        status: 0,
      });
    }

    return Promise.reject({
      message: error.message || 'An unexpected error occurred',
      status: 0,
    });
  }
);

export default axiosInstance;
