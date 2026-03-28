// ============================================================
//  API Client — Axios instance with JWT interceptor
// ============================================================

import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Request interceptor — attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401 (expired token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ---- Auth ----
export const login = (email, password) =>
  api.post('/api/v1/auth/login', { email, password });

export const getMe = () => api.get('/api/v1/auth/me');

// ---- Sensor Data ----
export const getSensorData = (params = {}) =>
  api.get('/api/v1/data', { params });

export const getLatestData = () =>
  api.get('/api/v1/data/latest');

// ---- Devices ----
export const getDevices = () =>
  api.get('/api/v1/devices');

export const createDevice = (name, location) =>
  api.post('/api/v1/devices', { name, location });

export default api;
