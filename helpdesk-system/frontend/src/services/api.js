import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hd_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('hd_token');
      localStorage.removeItem('hd_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────
export const authApi = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

// ── Tickets ───────────────────────────────────────────────────────────────
export const ticketsApi = {
  getAll: (params) => api.get('/tickets', { params }),
  getAssigned: (params) => api.get('/tickets/assigned', { params }),
  getById: (id) => api.get(`/tickets/${id}`),
  create: (data) => api.post('/tickets', data),
  update: (id, data) => api.put(`/tickets/${id}`, data),
  getComments: (id) => api.get(`/tickets/${id}/comments`),
  addComment: (id, content, internal = false) =>
    api.post(`/tickets/${id}/comments`, { content, internal }),
  getStats: () => api.get('/tickets/stats/dashboard'),
  getAgents: () => api.get('/tickets/agents/list'),
};

export default api;
