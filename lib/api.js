import axios from "axios";

const getBaseURL = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window === "undefined") return "http://localhost:5001/api";
  return `http://${window.location.hostname}:5001/api`;
};

const api = axios.create({
  baseURL: getBaseURL(),
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
