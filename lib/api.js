import axios from "axios";

const getBaseURL = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  
  // Fallback for development if variable is missing
  if (typeof window !== "undefined") {
    const { hostname, protocol } = window.location;
    const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
    // If local, we usually use http and port 5001. 
    // If not local (like an accidental deployment without env vars), we match the current protocol.
    return `${isLocal ? "http" : protocol.replace(":", "")}://${hostname}:5001/api`;
  }
  
  return "http://localhost:5001/api";
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
