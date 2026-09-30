"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ChatSidebar } from "@/components/search/ChatSidebar";
import { ChatWindow } from "@/components/search/ChatWindow";
import { SourcesPanel } from "@/components/search/SourcesPanel";
import {
  getConversations,
  getConversation,
  createConversation,
  sendMessage,
  type Conversation,
  type ApiMessage,
} from "@/lib/api";
import {
  getSocket,
  type StreamingMessage,
  type ChatStatusPayload,
  type ChatTokenPayload,
  type ChatDonePayload,
  type ChatErrorPayload,
} from "@/lib/socket";

function SearchPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [streamingMessage, setStreamingMessage] = useState<StreamingMessage | null>(null);

  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Refs to avoid stale closures in socket callbacks
  const activeIdRef = useRef<string | null>(null);
  activeIdRef.current = activeConversationId;

  const streamingMessageRef = useRef<StreamingMessage | null>(null);
  streamingMessageRef.current = streamingMessage;

  const wasStreamingRef = useRef<boolean>(false);

  // 1. Socket Connection & Event Handling
  useEffect(() => {
    const socket = getSocket();
    socket.connect();

    const handleStatus = (payload: ChatStatusPayload) => {
      const currentActiveId = activeIdRef.current;
      if (payload.conversation_id === currentActiveId) {
        setIsSending(true);
        setSendError(null);

        // Replace optimistic user message if server user_message is provided
        if (payload.user_message) {
          const serverUserMsg = payload.user_message;
          setMessages((prev) => {
            const lastIdx = prev.findLastIndex((m) => m.role === "user");
            if (lastIdx !== -1 && String(prev[lastIdx].id).startsWith("temp-user-")) {
              const updated = [...prev];
              updated[lastIdx] = serverUserMsg;
              return updated;
            }
            if (prev.some((m) => String(m.id) === String(serverUserMsg.id))) {
              return prev;
            }
            return [...prev, serverUserMsg];
          });
        }

        const statusText =
          payload.stage === "searching"
            ? "Searching documents..."
            : payload.stage === "generating"
            ? "Generating answer..."
            : null;

        setStreamingMessage((prev) => {
          const currentContent = prev ? prev.content : "";
          return {
            conversation_id: payload.conversation_id,
            role: "assistant",
            content: currentContent,
            statusText: currentContent ? null : statusText,
          };
        });
        wasStreamingRef.current = true;
      }
    };

    const handleToken = (payload: ChatTokenPayload) => {
      const currentActiveId = activeIdRef.current;
      if (payload.conversation_id === currentActiveId) {
        setIsSending(true);
        setStreamingMessage((prev) => {
          const prevContent = prev ? prev.content : "";
          return {
            conversation_id: payload.conversation_id,
            role: "assistant",
            content: prevContent + payload.delta,
            statusText: null, // Clear status text on first token
          };
        });
        wasStreamingRef.current = true;
      }
    };

    const handleDone = (payload: ChatDonePayload) => {
      const currentActiveId = activeIdRef.current;

      if (payload.conversation_id === currentActiveId) {
        setMessages((prev) => [...prev, payload.assistant_message]);
        setStreamingMessage(null);
        setIsSending(false);
        wasStreamingRef.current = false;
      }

      // Always update sidebar list on chat:done
      setConversations((prev) => {
        const filtered = prev.filter((c) => c.id !== payload.conversation.id);
        return [payload.conversation, ...filtered];
      });
    };

    const handleError = (payload: ChatErrorPayload) => {
      const currentActiveId = activeIdRef.current;
      if (payload.conversation_id === currentActiveId) {
        setStreamingMessage(null);
        setIsSending(false);
        setSendError(payload.detail);
        wasStreamingRef.current = false;
      }
    };

    const handleDisconnect = () => {
      if (wasStreamingRef.current || streamingMessageRef.current !== null) {
        setStreamingMessage(null);
        setIsSending(false);
        setSendError("Connection lost, reconnecting...");
        wasStreamingRef.current = false;
      }
    };

    const handleConnect = async () => {
      const currentActiveId = activeIdRef.current;
      if (currentActiveId) {
        try {
          const detail = await getConversation(currentActiveId);
          if (activeIdRef.current === currentActiveId) {
            setMessages(detail.messages || []);
          }
        } catch {
          // Ignore fetch errors during reconnect
        }
      }
    };

    socket.on("chat:status", handleStatus);
    socket.on("chat:token", handleToken);
    socket.on("chat:done", handleDone);
    socket.on("chat:error", handleError);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect", handleConnect);

    return () => {
      socket.off("chat:status", handleStatus);
      socket.off("chat:token", handleToken);
      socket.off("chat:done", handleDone);
      socket.off("chat:error", handleError);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect", handleConnect);
      socket.disconnect();
    };
  }, []);

  // 2. Initial Load: fetch conversations & handle ?c=<id> URL parameter
  useEffect(() => {
    let isMounted = true;
    const initialC = searchParams.get("c");

    async function init() {
      setIsLoadingConversations(true);
      try {
        const convs = await getConversations();
        if (!isMounted) return;
        setConversations(convs);

        if (initialC) {
          setActiveConversationId(initialC);
          activeIdRef.current = initialC;
          setIsLoadingChat(true);
          try {
            const detail = await getConversation(initialC);
            if (!isMounted) return;
            if (detail && detail.id) {
              setMessages(detail.messages || []);
            } else {
              setActiveConversationId(null);
              activeIdRef.current = null;
              router.replace(pathname, { scroll: false });
            }
          } catch {
            if (!isMounted) return;
            setActiveConversationId(null);
            activeIdRef.current = null;
            router.replace(pathname, { scroll: false });
          } finally {
            if (isMounted) setIsLoadingChat(false);
          }
        }
      } catch {
        // Handled by 401 redirect in api.ts
      } finally {
        if (isMounted) setIsLoadingConversations(false);
      }
    }

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  // 3. Select Conversation from Sidebar (Allowed during streaming)
  const handleSelectConversation = useCallback(
    async (id: string) => {
      if (id === activeConversationId) return;

      setActiveConversationId(id);
      activeIdRef.current = id;
      setIsSending(false);
      setStreamingMessage(null);
      streamingMessageRef.current = null;
      wasStreamingRef.current = false;
      setSendError(null);

      router.replace(`${pathname}?c=${id}`, { scroll: false });

      setIsLoadingChat(true);
      setMessages([]);
      try {
        const detail = await getConversation(id);
        if (activeIdRef.current === id) {
          setMessages(detail.messages || []);
        }
      } catch (err: unknown) {
        if (activeIdRef.current === id) {
          const msg = err instanceof Error ? err.message : "Failed to load conversation";
          setSendError(msg);
        }
      } finally {
        if (activeIdRef.current === id) {
          setIsLoadingChat(false);
        }
      }
    },
    [activeConversationId, pathname, router]
  );

  // 4. New Button: Clear active conversation, focus input (Allowed during streaming)
  const handleNewChat = useCallback(() => {
    setActiveConversationId(null);
    activeIdRef.current = null;
    setIsSending(false);
    setStreamingMessage(null);
    streamingMessageRef.current = null;
    wasStreamingRef.current = false;
    setMessages([]);
    setSendError(null);

    router.replace(pathname, { scroll: false });

    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  }, [pathname, router]);

  // 5. Send Message: Handle creation if no active chat, optimistic UI, socket emit & REST fallback
  const handleSend = useCallback(
    async (text: string) => {
      if (!text.trim() || isSending) return;

      setSendError(null);
      setIsSending(true);

      const trimmedContent = text.trim();
      const tempUserMessage: ApiMessage = {
        id: `temp-user-${Date.now()}`,
        role: "user",
        content: trimmedContent,
      };

      let targetId = activeIdRef.current;

      try {
        // If no active conversation, create one first
        if (!targetId) {
          const newConv = await createConversation();
          targetId = newConv.id;
          setActiveConversationId(targetId);
          activeIdRef.current = targetId;
          router.replace(`${pathname}?c=${targetId}`, { scroll: false });

          setConversations((prev) => [
            { id: newConv.id, title: newConv.title || "New Chat", created_at: newConv.created_at },
            ...prev,
          ]);
        }

        // Show user message optimistically
        setMessages((prev) => [...prev, tempUserMessage]);

        const socket = getSocket();
        if (socket.connected) {
          // Socket streaming flow
          setStreamingMessage({
            conversation_id: targetId,
            role: "assistant",
            content: "",
            statusText: "Searching documents...",
          });
          wasStreamingRef.current = true;

          socket.emit("chat:send", {
            conversation_id: targetId,
            content: trimmedContent,
          });
        } else {
          // REST Fallback flow
          const response = await sendMessage(targetId, trimmedContent);

          if (activeIdRef.current === targetId) {
            setMessages((prev) => {
              const filtered = prev.filter((m) => m.id !== tempUserMessage.id);
              return [...filtered, response.user_message, response.assistant_message];
            });
          }

          setConversations((prev) => {
            const filtered = prev.filter((c) => c.id !== response.conversation.id);
            return [response.conversation, ...filtered];
          });
          setIsSending(false);
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "Something went wrong";

        if (activeIdRef.current === targetId || (!activeIdRef.current && targetId)) {
          setSendError(errorMsg);
        }
        setIsSending(false);
        setStreamingMessage(null);
        wasStreamingRef.current = false;
      }
    },
    [isSending, pathname, router]
  );

  return (
    <div className="section-dark flex h-[95vh] w-full overflow-hidden">
      <ChatSidebar
        collapsed={leftCollapsed}
        conversations={conversations}
        activeConversationId={activeConversationId}
        isLoading={isLoadingConversations}
        onToggle={() => setLeftCollapsed((c) => !c)}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
      />

      <ChatWindow
        messages={messages}
        streamingMessage={streamingMessage}
        activeConversationId={activeConversationId}
        isLoadingChat={isLoadingChat}
        isSending={isSending}
        sendError={sendError}
        leftCollapsed={leftCollapsed}
        rightCollapsed={rightCollapsed}
        inputRef={inputRef}
        onToggleLeft={() => setLeftCollapsed((c) => !c)}
        onToggleRight={() => setRightCollapsed((c) => !c)}
        onSend={handleSend}
      />

      <SourcesPanel collapsed={rightCollapsed} onToggle={() => setRightCollapsed((c) => !c)} />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="section-dark flex h-[95vh] w-full items-center justify-center text-sm text-[var(--muted-light)]">
          Loading...
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}