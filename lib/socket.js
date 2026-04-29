import { io } from "socket.io-client";

let socket = null;

export const initSocket = (userId) => {
  if (socket?.connected) return socket;

  // Derive socket URL from API URL if not provided
  let socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
  
  if (!socketUrl && process.env.NEXT_PUBLIC_API_URL) {
    socketUrl = process.env.NEXT_PUBLIC_API_URL.replace(/\/api$/, "");
  }

  if (!socketUrl) {
    if (typeof window !== "undefined") {
      const { hostname, protocol } = window.location;
      const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
      socketUrl = `${isLocal ? "http" : protocol.replace(":", "")}://${hostname}:5001`;
    } else {
      socketUrl = "http://localhost:5001";
    }
  }

  socket = io(socketUrl, {
    query: { userId },
    withCredentials: true,
    transports: ["websocket"],
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
