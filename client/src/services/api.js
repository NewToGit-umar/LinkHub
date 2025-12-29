import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('linkhub_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('linkhub_token')
      localStorage.removeItem('linkhub_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API calls - use real server endpoints
export const authAPI = {
  login: (credentials) => {
    return api.post('/auth/login', credentials)
  },
  register: (userData) => {
    return api.post('/auth/register', userData)
  },
}

export const dashboardAPI = {
  getDashboardData: () => {
    // Keep a server call for dashboard so it can return real data later
    return api.get('/dashboard')
  }
}

export const socialAPI = {
  list: () => api.get('/social'),
  start: (provider) => api.get(`/social/start/${provider}`),
  callback: (provider, data) => api.post(`/social/callback/${provider}`, data),
  disconnect: (provider) => api.post(`/social/disconnect/${provider}`),
  refresh: (provider) => api.post(`/social/refresh/${provider}`),
}

export const postsAPI = {
  create: (data) => api.post('/posts', data),
  list: () => api.get('/posts'),
  publish: (id) => api.post(`/posts/${id}/publish`),
}

export const analyticsAPI = {
  fetch: () => api.post('/analytics/fetch'),
  summary: (params) => api.get('/analytics/summary', { params }),
  aggregate: (params) => api.get('/analytics/aggregate', { params })
}

export default api