import { io } from "socket.io-client";

let socket;

export const connectSocket = (token) => {
  if (!socket) {
    socket = io("https://app.dentago.uz", {
      auth: { token },
      transports: ["websocket"],
    });
  }
  return socket;
};

export const getSocket = () => socket;
