import axios from 'axios';

const getBaseURL = () => {
  // Always prefer explicit env variable (set this in Vercel frontend project settings)
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;

  const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

  // Local IP / LAN access (mobile testing via Wi-Fi) → connect to port 5000
  const isLocal = /^(localhost|127\.0\.0\.1|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host);
  if (isLocal) return `http://${host}:5000/api`;

  // Production / Vercel domain — VITE_API_URL must be set in Vercel dashboard!
  console.warn('VITE_API_URL is not set. Please configure it in your Vercel frontend project settings.');
  return '';
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
