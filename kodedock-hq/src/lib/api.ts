import axios from "axios";

// Create a centralized Axios instance
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4001",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to attach the token to every request automatically
api.interceptors.request.use(
  (config) => {
    // Note: Assuming token is stored in localStorage by AuthContext
    const token = localStorage.getItem("hq_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Interceptor to handle global errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Unauthorized: Token expired or invalid.");
      localStorage.removeItem("hq_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);
