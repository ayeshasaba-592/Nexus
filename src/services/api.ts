import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://nexus-production-9dfd.up.railway.app/api',
});

// This interceptor automatically grabs your token from localStorage 
// and puts it in the header for every single call.
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
});

export default API;