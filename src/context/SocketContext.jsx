import React, { createContext, useContext, useEffect, useState } from "react";
import { connectSocket } from "../lib/socket";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      const socketInstance = connectSocket(token);
      setSocket(socketInstance);
    }
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
