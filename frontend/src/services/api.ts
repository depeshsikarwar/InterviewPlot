import axios, { AxiosError } from 'axios';

export const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject bearer token if present in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('interviewpilot_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ success: boolean; error: { code: string; message: string } }>) => {
    if (error.response?.status === 401) {
      // If unauthorized and not already on auth page, we can clear token
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        localStorage.removeItem('interviewpilot_token');
      }
    }
    return Promise.reject(error);
  }
);
