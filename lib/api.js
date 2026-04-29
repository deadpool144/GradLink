import axios from "axios";

const getBaseURL = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  // Fallback for local development if variable is missing
  const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
  return `http://${host}:5001/api`;
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
