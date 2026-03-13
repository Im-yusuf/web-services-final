// Axios instance used by all frontend API calls.
// In production the base URL is set via VITE_API_BASE_URL; in dev the Vite
// proxy rewrites /api requests to the local backend.
import axios from 'axios';

function resolveApiBaseUrl() {
  const raw = import.meta.env.VITE_API_BASE_URL?.trim();
  if (!raw) return '/api';

  if (raw.startsWith('/')) {
    return raw;
  }

  const withProtocol = raw.startsWith('http://') || raw.startsWith('https://')
    ? raw
    : `https://${raw}`;

  const withoutTrailingSlash = withProtocol.replace(/\/+$/, '');
  return withoutTrailingSlash.endsWith('/api')
    ? withoutTrailingSlash
    : `${withoutTrailingSlash}/api`;
}

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach auth token to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('econest_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses — session expired or token revoked
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('econest_token');
      localStorage.removeItem('econest_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
