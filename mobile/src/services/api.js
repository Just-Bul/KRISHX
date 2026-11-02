import axios from 'axios';
import { getAccessToken, getRefreshToken, storeTokens, clearAll } from '../utils/storage';
import { API_BASE_URL } from '../config';

export const BASE_URL = API_BASE_URL;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Auth-failed callback (set by AppContext on mount) ─────────────────────────
let _onAuthFailed = null;
export const setAuthFailedCallback = (fn) => { _onAuthFailed = fn; };

// ── Request interceptor: attach access token ──────────────────────────────────
api.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    if (__DEV__) console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: auto-refresh + error logging ───────────────────────
let isRefreshing = false;
let failedQueue  = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => {
    if (__DEV__) console.log(`[API] ${res.status} ${res.config?.url}`);
    return res;
  },
  async (error) => {
    const original = error.config;
    const code     = error.response?.data?.code;
    const status   = error.response?.status;

    // Auto-refresh on expired token
    if (status === 401 && code === 'TOKEN_EXPIRED' && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }
      original._retry = true;
      isRefreshing    = true;
      try {
        const refresh = await getRefreshToken();
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refresh_token: refresh });
        await storeTokens(data.access_token, data.refresh_token);
        if (__DEV__) console.log(`[API] Token refreshed, retrying ${original?.url}`);
        processQueue(null, data.access_token);
        original.headers.Authorization = `Bearer ${data.access_token}`;
        return api(original);
      } catch (err) {
        processQueue(err, null);
        await clearAll();
        if (__DEV__) console.warn('[API] Refresh token expired — logging out');
        // Notify AppContext so UI state is cleared too
        if (_onAuthFailed) _onAuthFailed();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    if (__DEV__) {
      if (error.response) {
        console.warn(`[API] Error ${status} on ${original?.url}:`,
          error.response.data?.error || error.message);
      } else {
        console.log(`[API] Network error on ${original?.url}:`, error.message);
      }
    }

    return Promise.reject(error);
  }
);

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  login:           (data)  => api.post('/auth/login',              data).then((r) => r.data),
  register:        (data)  => api.post('/auth/register',           data).then((r) => r.data),
  verifyOtp:       (data)  => api.post('/auth/verify-otp',         data).then((r) => r.data),
  resendOtp:       (data)  => api.post('/auth/resend-otp',         data).then((r) => r.data),
  forgotPassword:  (email) => api.post('/auth/forgot-password',    { email }).then((r) => r.data),
  verifyResetOtp:  (data)  => api.post('/auth/verify-reset-otp',   data).then((r) => r.data),
  resetPassword:   (data)  => api.post('/auth/reset-password',     data).then((r) => r.data),
};

// ── User ─────────────────────────────────────────────────────────────────────
export const userAPI = {
  getProfile:     ()     => api.get('/user/profile').then((r) => r.data),
  updateProfile:  (data) => api.put('/user/profile', data).then((r) => r.data),
  changePassword: (data) => api.put('/user/password', data).then((r) => r.data),
  getStats:       ()     => api.get('/user/stats').then((r) => r.data),
};

// ── Soil/Crop Predictions ─────────────────────────────────────────────────────
export const predictionAPI = {
  predict:    (data)   => api.post('/predict',       data).then((r) => r.data),
  getHistory: (params) => api.get('/history',  { params }).then((r) => r.data),
  getItem:    (id)     => api.get(`/history/${id}`).then((r) => r.data),
  deleteItem: (id)     => api.delete(`/history/${id}`).then((r) => r.data),
};

// ── Pest Detection ────────────────────────────────────────────────────────────
export const pestAPI = {
  detect: async (imageUri) => {
    const form     = new FormData();
    const filename = imageUri.split('/').pop() || 'image.jpg';
    const ext      = (filename.split('.').pop() || 'jpg').toLowerCase();
    const mime     = ext === 'png' ? 'image/png' : 'image/jpeg';
    form.append('image', { uri: imageUri, name: filename, type: mime });

    // Use fetch directly — axios default headers corrupt FormData boundary
    const token = await getAccessToken();
    const headers = { Accept: 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}/pest-detect`, {
      method: 'POST',
      headers,
      body: form,
    });
    const data = await res.json();
    if (!res.ok) throw { response: { data, status: res.status } };
    return data;
  },
  getHistory: (params) => api.get('/pest-history', { params }).then((r) => r.data),
  deleteItem: (id)     => api.delete(`/pest-history/${id}`).then((r) => r.data),
};

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminAPI = {
  getDashboard:    ()       => api.get('/admin/dashboard').then((r) => r.data),
  getUsers:        (page)   => api.get('/admin/users', { params: { page } }).then((r) => r.data),
  toggleUser:      (id, s)  => api.put(`/admin/users/${id}/status`, { is_active: s }).then((r) => r.data),
  getPredictions:  (params) => api.get('/admin/predictions', { params }).then((r) => r.data),
  deletePrediction:(id)     => api.delete(`/admin/predictions/${id}`).then((r) => r.data),
};

// ── Content (About Us, editable by admin) ────────────────────────────────────
export const contentAPI = {
  getAboutUs:    ()     => api.get('/about-us').then((r) => r.data),
  updateAboutUs: (text) => api.put('/admin/about-us', { text }).then((r) => r.data),
};

// ── Health ─────────────────────────────────────────────────────────────────────
// Separate instance with longer timeout — HF Space cold-start can take 30-60s
const healthAxios = axios.create({
  baseURL: BASE_URL,
  timeout: 45000,
  headers: { 'Content-Type': 'application/json' },
});

export const healthAPI = {
  check: () => healthAxios.get('/health').then((r) => r.data),
};

export default api;
