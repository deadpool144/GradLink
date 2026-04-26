import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

// Redirect to /auth on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (
      err.response?.status === 401 && 
      typeof window !== "undefined" && 
      !window.location.pathname.startsWith("/auth") &&
      window.location.pathname !== "/"
    ) {
      window.location.href = "/auth";
    }
    return Promise.reject(err);
  }
);

export default api;
