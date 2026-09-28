"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DynamicIcon } from "@/lib/icon";
import type { ChatSession, Message, Citation } from "@/types/chat";

export function ChatWindow({
  session,
  isStreaming,
  leftCollapsed,
  rightCollapsed,
  onToggleLeft,
  onToggleRight,
  onSend,
}: {
  session: ChatSession | null;
  isStreaming: boolean;
  leftCollapsed: boolean;
  rightCollapsed: boolean;
  onToggleLeft: () => void;
  onToggleRight: () => void;
  onSend: (text: string) => void;
}) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [session?.messages]);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    onSend(input);
    setInput("");
  };

  const hasMessages = !!session && session.messages.length > 0;

  return (
    <div className="flex h-full flex-1 flex-col" style={{ background: "var(--base)" }}>
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

      {/* Body: empty state OR messages */}
      {!hasMessages ? (
        <EmptyState />
      ) : (
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mx-auto flex max-w-[720px] flex-col gap-6">
            {session!.messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="flex-shrink-0 px-6 py-4" style={{ borderTop: "1px solid var(--border-dark)" }}>
        <div className="mx-auto flex max-w-[720px] items-center gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about your documents..."
            className="flex-1 rounded-xl px-4 py-3 text-sm outline-none"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-dark)",
              color: "var(--text-light)",
            }}
          />
          <SendButton onClick={handleSend} disabled={!input.trim() || isStreaming} />
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

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <Avatar role={message.role} />

      <div
        className="max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
        style={
          isUser
            ? { background: "var(--surface)", border: "1px solid var(--border-dark)" }
            : { background: "transparent" }
        }
      >
        {message.status === "thinking" ? (
          <LoadingIndicator />
        ) : (
          <>
            <RenderWithCitations text={message.text} citations={message.citations} />
            {message.status === "streaming" && <StreamingCursor />}
          </>
        )}
      </div>
    </div>
  );
}

const THINKING_PHRASES = [
  "Searching your documents...",
  "Reading relevant pages...",
  "Matching context...",
  "Reranking results...",
  "Drafting an answer...",
];

function LoadingIndicator() {
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((i) => (i + 1) % THINKING_PHRASES.length);
    }, 1400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2.5">
      <div className="flex gap-1">
        <PulseDot delay={0} />
        <PulseDot delay={0.15} />
        <PulseDot delay={0.3} />
      </div>
      <AnimatePresence mode="wait">
        <motion.span
          key={phraseIndex}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25 }}
          className="muted text-sm"
        >
          {THINKING_PHRASES[phraseIndex]}
        </motion.span>
      </AnimatePresence>
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

function StreamingCursor() {
  return (
    <motion.span
      animate={{ opacity: [1, 0.2, 1] }}
      transition={{ duration: 0.8, repeat: Infinity }}
      className="ml-0.5 inline-block h-3.5 w-1.5 align-middle"
      style={{ background: "var(--accent)", borderRadius: 1 }}
    />
  );
}

function RenderWithCitations({ text, citations }: { text: string; citations?: Citation[] }) {
  if (!citations || citations.length === 0) return <span>{text}</span>;

  const parts = text.split(/(\[\d+\])/g);

  return (
    <span>
      {parts.map((part, i) => {
        const match = part.match(/^\[(\d+)\]$/);
        if (match) {
          const citation = citations.find((c) => c.id === Number(match[1]));
          if (citation) return <CitationChip key={i} citation={citation} />;
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}

function CitationChip({ citation }: { citation: Citation }) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-block">
      <button
        onClick={() => setOpen((o) => !o)}
        className="mx-0.5 inline-flex h-5 w-5 items-center justify-center rounded-md align-middle text-[11px] font-semibold"
        style={{
          background: open ? "rgba(183, 217, 107, 0.28)" : "var(--accent-pale)",
          color: "var(--accent)",
          boxShadow: open ? "0 0 8px rgba(183,217,107,0.3)" : "none",
        }}
      >
        {citation.id}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full z-20 mt-2 w-64 rounded-xl px-3.5 py-3 text-xs"
            style={{
              background: "var(--surface)",
              border: "1px solid rgba(183, 217, 107, 0.22)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.4), 0 0 16px rgba(183,217,107,0.08)",
            }}
          >
            <div className="mb-1.5 flex items-center gap-1.5 font-medium" style={{ color: "var(--accent)" }}>
              <DynamicIcon name="FileText" size={12} />
              {citation.docName} · p.{citation.page}
            </div>
            <p className="muted leading-relaxed">{citation.excerpt}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}