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

export default api;
