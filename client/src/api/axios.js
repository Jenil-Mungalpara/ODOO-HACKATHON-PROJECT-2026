import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api'
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('fleetflow_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('fleetflow_token');
      localStorage.removeItem('fleetflow_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;
