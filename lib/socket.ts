import { io, Socket } from "socket.io-client";
import { getTokenCookie, ApiMessage, Conversation, ApiSource } from "./api";

export interface ChatStatusPayload {
  conversation_id: string;
  stage: "searching" | "generating";
  user_message?: ApiMessage;
}

export interface ChatTokenPayload {
  conversation_id: string;
  delta: string;
}

export interface ChatDonePayload {
  conversation_id: string;
  assistant_message: ApiMessage;
  conversation: Conversation;
}

export interface ChatErrorPayload {
  conversation_id: string;
  detail: string;
}

export interface StreamingMessage {
  id?: string;
  conversation_id: string;
  role: "assistant";
  content: string;
  statusText?: string | null;
  sources?: ApiSource[] | null;
}

export interface DocumentStatusPayload {
  id: string;
  document_id: number;
  filename?: string;
  status: "pending" | "processing" | "ready" | "completed" | "failed";
  step?: string;
  pages?: number;
  chunks?: number;
  error?: string;
}

export interface ServerToClientEvents {
  "chat:status": (payload: ChatStatusPayload) => void;
  "chat:token": (payload: ChatTokenPayload) => void;
  "chat:done": (payload: ChatDonePayload) => void;
  "chat:error": (payload: ChatErrorPayload) => void;
  "document:status": (payload: DocumentStatusPayload) => void;
}

export interface ClientToServerEvents {
  "chat:send": (payload: { conversation_id: string; content: string; document_id?: string | null }) => void;
}

export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socketInstance: TypedSocket | null = null;

export function getSocket(): TypedSocket {
  if (!socketInstance) {
    const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    socketInstance = io(SOCKET_URL, {
      autoConnect: false,
      auth: (cb) => {
        const token = getTokenCookie() || "";
        cb({ token });
      },
    });

    socketInstance.on("connect_error", (err) => {
      const msg = err?.message || "";
      if (msg.toLowerCase() === "unauthorized" || msg.toLowerCase().includes("unauthorized")) {
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    });
  }

  return socketInstance;
}
