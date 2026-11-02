import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors uniformly
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login if session expired (except if already on login page)
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login?expired=true';
      }
    }
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (studentData) => api.post('/auth/register', studentData),
  candidateEntry: (candidateData) => api.post('/auth/candidate-entry', candidateData),
  getMe: () => api.get('/auth/me')
};

export const testApi = {
  getActiveTests: () => api.get('/tests'),
  getTestById: (id) => api.get(`/tests/${id}`),
  startTest: (id) => api.post(`/tests/${id}/start`),
  getAttempt: (id) => api.get(`/attempts/${id}`),
  saveAnswer: (attemptId, data) => api.post(`/attempts/${attemptId}/answers`, data),
  submitAttempt: (attemptId) => api.post(`/attempts/${attemptId}/submit`),
  getResult: (attemptId) => api.get(`/results/${attemptId}`),
  logAudit: (attemptId, data) => api.post(`/attempts/${attemptId}/audit`, data)
};

export const codeApi = {
  runCode: (data) => api.post('/code/run', data),
  submitCode: (data) => api.post('/code/submit', data)
};

export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),
  getTests: () => api.get('/admin/tests'),
  getTestById: (id) => api.get(`/admin/tests/${id}`),
  createTest: (data) => api.post('/admin/tests', data),
  updateTest: (id, data) => api.put(`/admin/tests/${id}`, data),
  deleteTest: (id) => api.delete(`/admin/tests/${id}`),
  duplicateTest: (id) => api.post(`/admin/tests/${id}/duplicate`),
  togglePublish: (id) => api.patch(`/admin/tests/${id}/publish`),
  getResults: (params) => api.get('/admin/results', { params }),
  exportResultsUrl: '/api/admin/results/export',
  exportResults: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/admin/results/export', {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    if (!response.ok) {
      throw new Error(`Export failed (${response.status}: ${response.statusText})`);
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'assessment_results.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
  getStudents: () => api.get('/admin/students')
};

export default api;
