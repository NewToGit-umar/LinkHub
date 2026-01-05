import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

// Create a separate instance for file uploads with longer timeout
const uploadApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 minutes for video uploads
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

// Same interceptor for upload API
uploadApi.interceptors.request.use(
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

uploadApi.interceptors.response.use(
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
  googleAuth: (credential) => {
    return api.post('/auth/google', { credential })
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
  cancel: (id) => api.delete(`/posts/${id}`),
  update: (id, data) => api.put(`/posts/${id}`, data),
}

export const mediaAPI = {
  uploadVideo: (file, onProgress) => {
    const formData = new FormData()
    formData.append('video', file)
    return uploadApi.post('/media', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(percentCompleted)
        }
      }
    })
  },
  uploadImage: (file, onProgress) => {
    const formData = new FormData()
    formData.append('image', file)
    return api.post('/media/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(percentCompleted)
        }
      }
    })
  },
  uploadImages: (files, onProgress) => {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('images', file)
    })
    return api.post('/media/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(percentCompleted)
        }
      }
    })
  },
  deleteVideo: (filename) => api.delete(`/media/${filename}`),
  deleteImage: (filename) => api.delete(`/media/image/${filename}`),
}

export const analyticsAPI = {
  fetch: () => api.post('/analytics/fetch'),
  summary: (params) => api.get('/analytics/summary', { params }),
  aggregate: (params) => api.get('/analytics/aggregate', { params })
}

export const bioAPI = {
  create: (data) => api.post('/bio/pages', data),
  getBySlug: (slug) => api.get(`/bio/pages/${slug}`),
  update: (id, data) => api.patch(`/bio/pages/${id}`, data)
}

export const templatesAPI = {
  list: () => api.get('/templates'),
  getBySlug: (slug) => api.get(`/templates/${slug}`),
  create: (data) => api.post('/templates', data),
  apply: (bioPageId, templateSlug) => api.post('/templates/apply', { bioPageId, templateSlug })
}

export const engagementAPI = {
  trackClick: (linkId, data) => api.post(`/engagement/click/${linkId}`, data),
  getLinkStats: (linkId, params) => api.get(`/engagement/link/${linkId}`, { params }),
  getBioPageEngagement: (bioPageId, params) => api.get(`/engagement/page/${bioPageId}`, { params }),
  getUserEngagement: (params) => api.get('/engagement/user', { params })
}

export const teamsAPI = {
  create: (data) => api.post('/teams', data),
  list: () => api.get('/teams'),
  get: (slug) => api.get(`/teams/${slug}`),
  update: (slug, data) => api.patch(`/teams/${slug}`, data),
  delete: (slug) => api.delete(`/teams/${slug}`),
  getMembers: (slug) => api.get(`/teams/${slug}/members`),
  addMember: (slug, data) => api.post(`/teams/${slug}/members`, data),
  removeMember: (slug, memberId) => api.delete(`/teams/${slug}/members/${memberId}`),
  updateMemberRole: (slug, memberId, role) => api.patch(`/teams/${slug}/members/${memberId}/role`, { role })
}

export const invitationsAPI = {
  getUserInvitations: () => api.get('/invitations/me'),
  getByToken: (token) => api.get(`/invitations/token/${token}`),
  accept: (token) => api.post(`/invitations/accept/${token}`),
  decline: (token) => api.post(`/invitations/decline/${token}`),
  getTeamInvitations: (slug) => api.get(`/invitations/team/${slug}`),
  create: (slug, data) => api.post(`/invitations/team/${slug}`, data),
  revoke: (slug, invitationId) => api.delete(`/invitations/team/${slug}/${invitationId}`),
  resend: (slug, invitationId) => api.post(`/invitations/team/${slug}/${invitationId}/resend`)
}

export const commentsAPI = {
  create: (data) => api.post('/comments', data),
  getPostComments: (postId, params) => api.get(`/comments/post/${postId}`, { params }),
  getReplies: (commentId, params) => api.get(`/comments/${commentId}/replies`, { params }),
  update: (commentId, data) => api.patch(`/comments/${commentId}`, data),
  delete: (commentId) => api.delete(`/comments/${commentId}`),
  react: (commentId, reaction) => api.post(`/comments/${commentId}/react`, { reaction })
}

export const notificationsAPI = {
  list: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.post(`/notifications/${id}/read`),
  markAllAsRead: () => api.post('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
  clearRead: () => api.delete('/notifications/clear-read')
}

export const milestonesAPI = {
  getProgress: () => api.get('/milestones'),
  triggerCheck: () => api.post('/milestones/check')
}

export const adminAPI = {
  getOverview: () => api.get('/admin/overview'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserRole: (userId, role) => api.patch(`/admin/users/${userId}/role`, { role }),
  toggleUserSuspension: (userId) => api.post(`/admin/users/${userId}/suspend`),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  getSystemAnalytics: () => api.get('/admin/analytics')
}

export const privacyAPI = {
  exportData: () => api.get('/privacy/export'),
  deleteAccount: (confirmDelete) => api.post('/privacy/delete-account', { confirmDelete }),
  getSettings: () => api.get('/privacy/settings'),
  updateSettings: (settings) => api.patch('/privacy/settings', settings)
}

export const profileAPI = {
  get: () => api.get('/profile'),
  update: (data) => api.patch('/profile', data),
  uploadAvatar: (formData) => api.post('/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteAvatar: () => api.delete('/profile/avatar'),
  changePassword: (data) => api.post('/profile/change-password', data)
}

export const landingAPI = {
  getProfile: () => api.get('/landing/profile'),
  updateProfile: (data) => api.put('/landing/profile', data),
  uploadAvatar: (formData) => api.post('/landing/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export const publicProfileAPI = {
  getProfile: (username) => api.get(`/u/${username}`),
  trackView: (username, data) => api.post(`/u/${username}/view`, data),
  trackClick: (username, linkId) => api.post(`/u/${username}/click/${linkId}`),
  checkUsername: (username) => api.get(`/u/check/${username}`)
}

export default api