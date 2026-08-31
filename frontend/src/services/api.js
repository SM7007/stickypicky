import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  return `http://${host}:5000/api`;
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sp_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global response error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const isPublicRoute = url.includes('/payments') || url.includes('/products') || url.includes('/categories');
    if (error.response?.status === 401 && !isPublicRoute) {
      localStorage.removeItem('sp_token');
      localStorage.removeItem('sp_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
