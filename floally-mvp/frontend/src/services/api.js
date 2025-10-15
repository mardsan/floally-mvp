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

export const userProfile = {
  getProfile: (userEmail) => api.get(`/api/user/profile?user_email=${encodeURIComponent(userEmail)}`),
  completeOnboarding: (userEmail, answers) => api.post(`/api/user/profile/onboarding?user_email=${encodeURIComponent(userEmail)}`, answers),
  updateProfile: (userEmail, updates) => api.put(`/api/user/profile?user_email=${encodeURIComponent(userEmail)}`, updates),
  getInsights: (userEmail) => api.get(`/api/user/profile/insights?user_email=${encodeURIComponent(userEmail)}`),
};

export default api;
