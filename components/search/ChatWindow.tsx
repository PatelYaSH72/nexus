"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DynamicIcon } from "@/lib/icon";
import type { ApiMessage, ApiSource } from "@/lib/api";
import type { StreamingMessage } from "@/lib/socket";

export function ChatWindow({
  messages,
  streamingMessage,
  activeConversationId,
  isLoadingChat,
  isSending,
  sendError,
  leftCollapsed,
  rightCollapsed,
  inputRef,
  onToggleLeft,
  onToggleRight,
  onSend,
}: {
  messages: ApiMessage[];
  streamingMessage?: StreamingMessage | null;
  activeConversationId: string | null;
  isLoadingChat?: boolean;
  isSending?: boolean;
  sendError?: string | null;
  leftCollapsed: boolean;
  rightCollapsed: boolean;
  inputRef?: React.RefObject<HTMLTextAreaElement>;
  onToggleLeft: () => void;
  onToggleRight: () => void;
  onSend: (text: string) => void;
}) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const userScrolledUpRef = useRef(false);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 80;
    userScrolledUpRef.current = !isAtBottom;
  };

  useEffect(() => {
    userScrolledUpRef.current = false;
  }, [activeConversationId]);

  useEffect(() => {
    if (scrollRef.current && !userScrolledUpRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingMessage, isSending, isLoadingChat, sendError]);

  const handleSend = () => {
    if (!input.trim() || isSending) return;
    onSend(input);
    setInput("");
  };

  const hasMessages = messages.length > 0 || isSending || !!streamingMessage;

  return (
    <div className="flex h-full flex-1 flex-col" style={{ background: "var(--base)" }}>
      {/* Header */}
      <div
        className="flex flex-shrink-0 items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid var(--border-dark)" }}
      >
        <div className="flex items-center gap-3">
          {leftCollapsed && (
            <button onClick={onToggleLeft} style={{ color: "var(--muted-light)" }}>
              <DynamicIcon name="PanelLeftOpen" size={17} />
            </button>
          )}
          <h1 className="text-[15px] font-semibold">
            {hasMessages ? "Ask about your documents" : "\u00A0"}
          </h1>
        </div>

        {rightCollapsed && (
          <button
            onClick={onToggleRight}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs"
            style={{ border: "1px solid var(--border-dark)", color: "var(--muted-light)" }}
          >
            Sources
            <DynamicIcon name="PanelRightOpen" size={14} />
          </button>
        )}
      </div>

      {/* Body: Loading OR Empty state OR messages */}
      {isLoadingChat ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="muted text-sm flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[var(--accent)] animate-ping" />
            Loading chat...
          </p>
        </div>
      ) : !hasMessages ? (
        <EmptyState />
      ) : (
        <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto flex max-w-[720px] flex-col gap-6">
            {messages.map((msg, index) => {
              const isLastUserMessage =
                msg.role === "user" &&
                index === messages.findLastIndex((m) => m.role === "user");

              return (
                <div key={msg.id || index} className="flex flex-col">
                  <MessageBubble message={msg} />
                  {isLastUserMessage && sendError && (
                    <div
                      className="mt-2.5 max-w-[80%] self-end rounded-xl px-3.5 py-2 text-xs leading-relaxed"
                      style={{
                        background: "rgba(239, 68, 68, 0.10)",
                        border: "1px solid rgba(239, 68, 68, 0.25)",
                        color: "#f87171",
                      }}
                    >
                      {sendError}
                    </div>
                  )}
                </div>
              );
            })}

            {streamingMessage && (
              <div className="flex items-start gap-3">
                <Avatar role="assistant" />
                <div
                  className="max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words"
                  style={{ background: "transparent" }}
                >
                  {streamingMessage.statusText && !streamingMessage.content ? (
                    <LoadingIndicator text={streamingMessage.statusText} />
                  ) : (
                    <span>{streamingMessage.content}</span>
                  )}
                </div>
              </div>
            )}

            {!streamingMessage && isSending && (
              <div className="flex items-start gap-3">
                <Avatar role="assistant" />
                <div
                  className="max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
                  style={{ background: "transparent" }}
                >
                  <LoadingIndicator text="Searching documents..." />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="flex-shrink-0 px-6 py-4" style={{ borderTop: "1px solid var(--border-dark)" }}>
        <div className="mx-auto flex max-w-[720px] items-center gap-3">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={isSending}
            placeholder="Ask about your documents..."
            className="flex-1 rounded-xl px-4 py-3 text-sm outline-none resize-none"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-dark)",
              color: "var(--text-light)",
              opacity: isSending ? 0.6 : 1,
            }}
          />
          <SendButton onClick={handleSend} disabled={!input.trim() || isSending} />
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{
          background: "var(--accent-pale)",
          boxShadow: "0 0 24px rgba(183, 217, 107, 0.18)",
        }}
      >
        <DynamicIcon name="Zap" size={24} style={{ color: "var(--accent)" }} />
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mt-5 text-lg font-semibold"
      >
        Ask about your documents
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="muted mt-1.5 text-sm"
      >
        Get answers with citations from your knowledge base
      </motion.p>
    </div>
  );
}

function SendButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.06 } : {}}
      whileTap={!disabled ? { scale: 0.94 } : {}}
      className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
      style={{
        background: disabled ? "var(--accent-pale)" : "var(--accent)",
        color: "var(--accent-ink)",
        opacity: disabled ? 0.5 : 1,
        boxShadow: disabled ? "none" : "0 0 0 rgba(183,217,107,0)",
        transition: "box-shadow 0.2s ease, background 0.2s ease",
        cursor: disabled ? "default" : "pointer",
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.boxShadow = "0 0 16px rgba(183, 217, 107, 0.4)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 0 0 rgba(183,217,107,0)";
      }}
    >
      <DynamicIcon name="ArrowUp" size={18} />
    </motion.button>
  );
}

function MessageBubble({ message }: { message: ApiMessage }) {
  const isUser = message.role === "user";
  const hasSources = message.sources && message.sources.length > 0;

  return (
    <div className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <Avatar role={message.role} />

      <div
        className="max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words"
        style={
          isUser
            ? { background: "var(--surface)", border: "1px solid var(--border-dark)" }
            : { background: "transparent" }
        }
      >
        <span>{message.content}</span>

        {hasSources && (
          <div className="mt-3 flex flex-wrap gap-1.5 pt-2" style={{ borderTop: "1px solid var(--border-dark)" }}>
            {message.sources!.map((source, i) => (
              <SourceChip key={i} source={source} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SourceChip({ source }: { source: ApiSource }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium"
      style={{
        background: "var(--accent-pale)",
        color: "var(--accent)",
        border: "1px solid rgba(183, 217, 107, 0.2)",
      }}
    >
      <DynamicIcon name="FileText" size={11} />
      <span>{source.filename}</span>
      {source.page && <span className="opacity-75">· p.{source.page}</span>}
    </span>
  );
}

function LoadingIndicator({ text }: { text?: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex gap-1">
        <PulseDot delay={0} />
        <PulseDot delay={0.15} />
        <PulseDot delay={0.3} />
      </div>
      <span className="muted text-sm">{text || "Searching documents..."}</span>
    </div>
  );
}

function PulseDot({ delay }: { delay: number }) {
  return (
    <motion.span
      animate={{ opacity: [0.3, 1, 0.3] }}
      transition={{ duration: 1.2, repeat: Infinity, delay }}
      className="h-1.5 w-1.5 rounded-full"
      style={{ background: "var(--accent)" }}
    />
  );
}

function Avatar({ role }: { role: "user" | "assistant" }) {
  if (role === "user") {
    return (
      <div
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold"
        style={{ background: "var(--surface)", border: "1px solid var(--border-dark)", color: "var(--text-light)" }}
      >
        <DynamicIcon name="User" size={14} />
      </div>
    );
  }
  return (
    <div
      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
      style={{ background: "var(--accent-pale)", boxShadow: "0 0 8px rgba(183,217,107,0.2)" }}
    >
      <DynamicIcon name="Zap" size={14} style={{ color: "var(--accent)" }} />
    </div>
  );
}