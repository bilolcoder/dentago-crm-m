import { io } from "socket.io-client";

let socket;

export const connectSocket = (token) => {
  if (!socket) {
    console.log("%c🔌 Socket orqali ulanish boshlandi...", "color: #3b82f6; font-size: 12px;");

    socket = io("https://app.dentago.uz", {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    // Connection event handlers with logging
    socket.on("connect", () => {
      console.log("%c✅ Socket ULANDIII!", "color: #22c55e; font-size: 14px; font-weight: bold;");
      console.log("📡 Socket ID:", socket.id);
      console.log("🔌 Connection URL: https://app.dentago.uz");
    });

    socket.on("disconnect", () => {
      console.log("%c❌ Socket uzildi", "color: #ef4444; font-size: 12px;");
    });

    socket.on("connect_error", (error) => {
      console.error("%c⚠️ Socket xatosi:", "color: #f59e0b; font-size: 12px;", error);
    });

    socket.on("error", (error) => {
      console.error("%c❌ Socket error event:", "color: #ef4444; font-size: 12px;", error);
    });

    console.log("%c📡 Socket instance yaratildi", "color: #8b5cf6; font-size: 12px;");
  }
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("%c🔌 Socket uzildi", "color: #ef4444; font-size: 12px;");
  }
};
