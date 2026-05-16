import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:8081/api/v1';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gacp_access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem('gacp_access_token');
      localStorage.removeItem('gacp_auth');
    }
    return Promise.reject(error);
  }
);

export default api;
