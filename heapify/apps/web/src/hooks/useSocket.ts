import { io, Socket } from "socket.io-client";
import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/auth.store";
import { useNotificationStore } from "../store/notification.store";

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const token = useAuthStore((s) => s.accessToken);
  const push = useNotificationStore((s) => s.push);

  useEffect(() => {
    if (!token) return;
    const socket = io(import.meta.env.VITE_API_URL, { auth: { token }, reconnection: true });
    socketRef.current = socket;
    socket.on("notification:new", (data) => push({ id: crypto.randomUUID(), message: data.message || "New notification" }));
    socket.on("chat:message", () => push({ id: crypto.randomUUID(), message: "New chat message" }));
    socket.on("substitute:request", () => push({ id: crypto.randomUUID(), message: "New substitute request" }));
    return () => { socket.disconnect(); socketRef.current = null; };
  }, [token, push]);

  return socketRef.current;
};

