import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on 401 if user was previously authenticated (had a token)
    // This prevents redirecting during login/register failures
    if (error.response && error.response.status === 401) {
      const token = localStorage.getItem("token");
      const isAuthEndpoint = error.config?.url?.includes('/auth/login') ||
                             error.config?.url?.includes('/auth/register') ||
                             error.config?.url?.includes('/auth/forgot-password');

      // Only auto-logout if user had a token and it's not a login/register attempt
      if (token && !isAuthEndpoint) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

// ============ User API ============
export const userApi = {
  search: (query) => api.get(`/users/search?q=${encodeURIComponent(query)}`),
  getProfile: (username) => api.get(`/users/profile/${username}`),
  getMe: () => api.get('/users/me'),
  updateProfile: (data) => api.patch('/users/me', data),
};

// ============ Friends API ============
export const friendsApi = {
  getAll: () => api.get('/friends'),
  getRequests: () => api.get('/friends/requests'),
  getSentRequests: () => api.get('/friends/sent'),
  sendRequest: (usernameOrEmail) => api.post('/friends/request', { usernameOrEmail }),
  acceptRequest: (id) => api.patch(`/friends/${id}/accept`),
  rejectRequest: (id) => api.patch(`/friends/${id}/reject`),
  removeFriend: (id) => api.delete(`/friends/${id}`),
  getFriendTasks: (friendId) => api.get(`/friends/${friendId}/tasks`),
};

// ============ Notifications API ============
export const notificationsApi = {
  getAll: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/mark-all-read'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// ============ Bumps API ============
export const bumpsApi = {
  sendBump: (taskId, message) => api.post('/bumps', { taskId, message }),
};

export default api;
