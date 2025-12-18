import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard'),
};

// Tasks API
export const tasksAPI = {
  getAll: (userId = 1) => api.get(`/tasks?user_id=${userId}`),
  
  create: (taskData) => api.post('/tasks', { user_id: 1, ...taskData }),
  
  analyze: (rawText) => api.post('/tasks/analyze', { raw_text: rawText }),
  
  update: (id, data) => api.put(`/tasks/${id}`, data),
  
  delete: (id) => api.delete(`/tasks/${id}`),
  
  testNotify: () => api.post('/tasks/test-notify'),
};

export default api;
