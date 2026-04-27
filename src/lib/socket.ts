import { io, Socket } from "socket.io-client";
import { HOST_API } from "@/environment";

export let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const token = localStorage.getItem("token");
    socket = io(HOST_API, {
      transports: ["websocket", "polling"],
      auth: {
        token,
      },
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 3000,
    });
  }
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
