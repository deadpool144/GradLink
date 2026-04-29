"use client";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser, clearUser } from "@/lib/slices/authSlice";
import { initSocket, disconnectSocket, getSocket } from "@/lib/socket";
import { appendMessage, setTyping, clearTyping } from "@/lib/slices/chatSlice";
import { prependNotification } from "@/lib/slices/notifSlice";
import { setOnlineUsers } from "@/lib/slices/authSlice";
import api from "@/lib/api";

export default function AuthProvider({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    api.get("/auth/me")
      .then(({ data }) => {
        const user = data.data;
        dispatch(setUser(user));
        localStorage.setItem("auth_user", JSON.stringify(user));

        // Init socket
        const socket = initSocket(user._id);

        socket.on("online_users", (ids) => dispatch(setOnlineUsers(ids)));
        socket.on("new_message", (msg) => dispatch(appendMessage(msg)));
        socket.on("new_notification", (notif) => dispatch(prependNotification(notif)));
        
        socket.on("typing", (data) => dispatch(setTyping(data)));
        socket.on("stop_typing", (data) => dispatch(clearTyping(data)));
      })
      .catch(() => {
        dispatch(clearUser());
        localStorage.removeItem("auth_user");
        disconnectSocket();
      });

    return () => {
      const s = getSocket();
      if (s) {
        s.off("online_users");
        s.off("new_message");
        s.off("new_notification");
      }
    };
  }, [dispatch]);

  return children;
}
