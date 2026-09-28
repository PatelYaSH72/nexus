"use client";

import { useState, useCallback } from "react";
import type { ChatSession, Message } from "@/types/chat";
import { streamAssistantReply, getCitationsForLastAnswer, deriveSessionTitle } from "@/lib/mockChatApi";

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

export function useChat() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const activeSession = sessions.find((s) => s.id === activeSessionId) ?? null;

  const createSession = useCallback(() => {
    const newSession: ChatSession = {
      id: makeId(),
      title: "New chat",
      messages: [],
      createdAt: Date.now(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    return newSession.id;
  }, []);

  const selectSession = useCallback((id: string) => {
    setActiveSessionId(id);
  }, []);

  const sendMessage = useCallback(
  async (text: string) => {
    if (!text.trim()) return;

    let sessionId = activeSessionId;
    if (!sessionId) {
      sessionId = createSession();
    }

    const userMessage: Message = {
      id: makeId(),
      role: "user",
      text,
      status: "complete",
    };

    const assistantId = makeId();
    const assistantMessage: Message = {
      id: assistantId,
      role: "assistant",
      text: "",
      status: "thinking",   // ← ye pehle wale message se already badla hua hoga
    };

    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              title: s.messages.length === 0 ? deriveSessionTitle(text) : s.title,
              messages: [...s.messages, userMessage, assistantMessage],
            }
          : s
      )
    );

    setIsStreaming(true);

    // 👇👇👇 YAHAN REPLACE KARNA HAI — purana loop hata ke ye naya daalo 👇👇👇
    let accumulated = "";
    let isFirstChunk = true;

    for await (const chunk of streamAssistantReply(text)) {
      accumulated += chunk;
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === assistantId
                    ? { ...m, text: accumulated, status: isFirstChunk ? "streaming" : m.status }
                    : m
                ),
              }
            : s
        )
      );
      isFirstChunk = false;
    }
    // 👆👆👆 REPLACE YAHAN TAK 👆👆👆

    const citations = await getCitationsForLastAnswer();
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              messages: s.messages.map((m) =>
                m.id === assistantId ? { ...m, status: "complete", citations } : m
              ),
            }
          : s
      )
    );

    setIsStreaming(false);
  },
  [activeSessionId, createSession]
);

  return {
    sessions,
    activeSession,
    activeSessionId,
    isStreaming,
    createSession,
    selectSession,
    sendMessage,
  };
}