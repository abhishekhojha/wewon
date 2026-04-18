// config/api.js
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor – normalise error.message from backend payload
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extract backend-provided message and attach it to error.message
    // so every catch block gets a meaningful string automatically.
    const backendMessage = error?.response?.data?.message;
    if (typeof backendMessage === "string" && backendMessage) {
      error.message = backendMessage;
    }
    return Promise.reject(error);
  },
);

export default apiClient;
