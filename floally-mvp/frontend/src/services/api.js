import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,  // Set to false for CORS with allow_origins=["*"]
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
  analyzeEmails: (messages) => api.post('/api/ai/analyze-emails', { messages }),
  generateResponse: (email, userContext = "") => api.post('/api/ai/generate-response', { email, user_context: userContext }),
};

export default api;
