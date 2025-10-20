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
  getMessages: (maxResults = 10, category = 'primary') => api.get(`/api/gmail/messages?max_results=${maxResults}&category=${category}`),
  getProfile: () => api.get('/api/gmail/profile'),
  markImportant: (emailId) => api.post(`/api/gmail/mark-important?email_id=${emailId}`),
  markUnimportant: (emailId) => api.post(`/api/gmail/mark-unimportant?email_id=${emailId}`),
  archive: (emailId) => api.post(`/api/gmail/archive?email_id=${emailId}`),
  trash: (emailId) => api.post(`/api/gmail/trash?email_id=${emailId}`),
  getUnsubscribeLink: (emailId) => api.get(`/api/gmail/unsubscribe-link?email_id=${emailId}`),
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

export const behavior = {
  logAction: (actionData) => api.post('/api/behavior/log-action', actionData),
  getSenderStats: (userEmail, senderEmail = null) => {
    const params = new URLSearchParams({ user_email: userEmail });
    if (senderEmail) params.append('sender_email', senderEmail);
    return api.get(`/api/behavior/sender-stats?${params}`);
  },
  getBehaviorLog: (userEmail, limit = 100) => api.get(`/api/behavior/behavior-log?user_email=${userEmail}&limit=${limit}`),
  getInsights: (userEmail) => api.get(`/api/behavior/insights?user_email=${userEmail}`),
};

export const profile = {
  getOverview: (userEmail) => api.get(`/api/profile/overview?user_email=${encodeURIComponent(userEmail)}`),
  getBehavioralInsights: (userEmail) => api.get(`/api/profile/behavioral-insights?user_email=${encodeURIComponent(userEmail)}`),
  getGoals: (userEmail) => api.get(`/api/user/profile/goals?user_email=${encodeURIComponent(userEmail)}`),
  addGoal: (userEmail, goal) => api.post(`/api/user/profile/goals?user_email=${encodeURIComponent(userEmail)}`, goal),
  updateGoal: (userEmail, goalIndex, updates) => api.put(`/api/user/profile/goals/${goalIndex}?user_email=${encodeURIComponent(userEmail)}`, updates),
  getSettings: (userEmail) => api.get(`/api/user/settings?user_email=${encodeURIComponent(userEmail)}`),
  updateSettings: (userEmail, settings) => api.put(`/api/user/settings?user_email=${encodeURIComponent(userEmail)}`, settings),
  getIntegrations: (userEmail) => api.get(`/api/user/integrations?user_email=${encodeURIComponent(userEmail)}`),
};

export const insights = {
  getBehavioral: (userEmail) => api.get(`/api/insights/behavioral?user_email=${encodeURIComponent(userEmail)}`),
  getOverview: (userEmail) => api.get(`/api/insights/overview?user_email=${encodeURIComponent(userEmail)}`),
};

export default api;
