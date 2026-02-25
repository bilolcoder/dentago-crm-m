import React, { createContext, useContext, useEffect, useState } from "react";
import { connectSocket } from "../lib/socket";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    console.log("%c🔍 SocketContext: Token qidirish...", "color: #3b82f6; font-size: 12px;");

    // Check both token and accessToken keys
    const token = localStorage.getItem("accessToken") || localStorage.getItem("token");

    if (token) {
      console.log("%c✅ Token topildi, socket ulash...", "color: #22c55e; font-size: 12px;");
      try {
        const socketInstance = connectSocket(token);

        // Make sure socket is connected or will connect
        if (socketInstance) {
          console.log("%c📡 Socket instance tayyor", "color: #8b5cf6; font-size: 12px;");
          setSocket(socketInstance);

          // Listen for connection
          socketInstance.on("connect", () => {
            console.log("%c🎉 Socket context: SOЕДИНЕНО!", "color: #22c55e; font-size: 12px;");
            setSocket(socketInstance);
          });
        } else {
          console.error("%c❌ Socket instance null", "color: #ef4444; font-size: 12px;");
        }
      } catch (error) {
        console.error("%c❌ Socket ulanishda xato:", "color: #ef4444; font-size: 12px;", error);
      }
    } else {
      console.warn("%c⚠️ Token topilmadi. Login qilgan yoki yo'q?", "color: #f59e0b; font-size: 12px;");
    }

    return () => {
      // Cleanup if needed
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const socket = useContext(SocketContext);

  if (!socket) {
    console.warn("%c⚠️ useSocket: Socket context null - SocketProvider wrapper tekshiring", "color: #f59e0b; font-size: 12px;");
  }

  return socket;
};
