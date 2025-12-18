import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// API Service Functions
export const apiService = {
  // Dashboard
  getDashboard: () => api.get('/api/dashboard'),

  // Tasks
  getTasks: (userId = 1) => api.get(`/api/tasks?user_id=${userId}`),
  
  analyzeTask: (rawText) => api.post('/api/tasks/analyze', { raw_text: rawText }),
  
  createTask: (taskData) => api.post('/api/tasks', { user_id: 1, ...taskData }),
  
  updateTask: (id, data) => api.put(`/api/tasks/${id}`, data),
  
  deleteTask: (id) => api.delete(`/api/tasks/${id}`),
  
  testNotify: () => api.post('/api/tasks/test-notify'),
};

export default api;
