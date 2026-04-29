import { io } from "socket.io-client";

let socket = null;

export const initSocket = (userId) => {
  if (socket?.connected) return socket;

  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 
    (typeof window !== "undefined" ? `http://${window.location.hostname}:5001` : "http://localhost:5001");

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
