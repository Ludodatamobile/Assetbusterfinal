import { io, type Socket } from "socket.io-client";
import { API_URL } from "@/lib/api";

export const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || API_URL.replace(/\/api\/v1\/?$/, "");

export function createUserSocket(accessToken: string): Socket {
  return io(SOCKET_URL, {
    auth: { token: accessToken },
    withCredentials: true,
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 8,
    reconnectionDelay: 700,
  });
}