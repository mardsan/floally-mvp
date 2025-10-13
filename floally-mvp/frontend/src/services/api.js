import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const auth = {
  login: () => api.get('/api/auth/login'),
  status: () => api.get('/api/auth/status'),
};

export const gmail = {
  getMessages: (maxResults = 10) => api.get(`/api/gmail/messages?max_results=${maxResults}`),
  getProfile: () => api.get('/api/gmail/profile'),
};

export const calendar = {
  getEvents: (days = 1) => api.get(`/api/calendar/events?days=${days}`),
  getCalendars: () => api.get('/api/calendar/calendars'),
};

export const ai = {
  generateStandup: (data) => api.post('/api/ai/standup', data),
};

export default api;
