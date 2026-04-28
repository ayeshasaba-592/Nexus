import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

// This adds the token to every request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers['x-auth-token'] = token;
  return config;
});

export const getMyMeetings = () => API.get('/meetings/me');
export const sendMeetingRequest = (data: any) => API.post('/meetings/request', data);