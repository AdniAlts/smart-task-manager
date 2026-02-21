import axios from 'axios';

// Use Vercel backend URL in production, localhost in development
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD 
    ? 'https://smart-task-manager-backend-delta.vercel.app/api'
    : 'http://localhost:3000/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for CORS with credentials
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard'),
};

// Tasks API
export const tasksAPI = {
  getAll: () => api.get('/tasks'),
  
  create: (taskData) => api.post('/tasks', taskData),
  
  analyze: (rawText) => api.post('/tasks/analyze', { raw_text: rawText }),
  
  update: (id, data) => api.put(`/tasks/${id}`, data),
  
  delete: (id) => api.delete(`/tasks/${id}`),
  
  testNotify: () => api.post('/tasks/test-notify'),
};

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateSettings: (data) => api.put('/auth/settings', data),
  deleteAccount: () => api.delete('/auth/delete'),
};

export default api;
