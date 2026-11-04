import axios from 'axios';

const configuredApiUrl = (import.meta.env.VITE_API_URL || '/api').trim();
const baseURL = configuredApiUrl.replace(/\/+$/, '') || '/api';

export const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: { Accept: 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    try {
      const token = window.sessionStorage.getItem('velveteen_admin_token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {
      // Public browsing and checkout should still work when session storage is blocked.
    }
  }
  return config;
});

export function getApiError(error, fallback = 'Something went wrong. Please try again.') {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.code === 'ECONNABORTED') return 'The request timed out. Please try again.';
  if (!error?.response) return 'The shop service could not be reached. Please try again in a moment.';
  return fallback;
}
