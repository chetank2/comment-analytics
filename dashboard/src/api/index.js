import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API
export const authAPI = {
  login: (token) => axios.post(`${API_URL}/auth/google`, { token }),
  getProfile: () => api.get('/auth/me')
};

// Videos API
export const videosAPI = {
  getVideos: () => api.get('/videos'),
  getVideo: (videoId) => api.get(`/videos/${videoId}`),
  getComments: (videoId, params) => api.get(`/videos/${videoId}/comments`, { params }),
  analyzeVideo: (videoId, data) => api.post(`/videos/${videoId}/comments`, data)
};

// User API
export const userAPI = {
  getUsage: () => api.get('/user/usage'),
  updateSubscription: (subscription) => api.post('/user/subscription', { subscription }),
  addChannel: (channelData) => api.post('/user/channels', channelData)
};

export default {
  auth: authAPI,
  videos: videosAPI,
  user: userAPI
};
