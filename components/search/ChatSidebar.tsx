"use client";

import { motion, AnimatePresence } from "framer-motion";
import { DynamicIcon } from "@/lib/icon";
import type { ChatSession } from "@/types/chat";

export function ChatSidebar({
  collapsed,
  sessions,
  activeSessionId,
  onToggle,
  onSelectSession,
  onNewChat,
}: {
  collapsed: boolean;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onToggle: () => void;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
}) {
  return (
    <motion.div
      animate={{ width: collapsed ? 56 : 240 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="flex h-full flex-shrink-0 flex-col overflow-hidden"
      style={{ borderRight: "1px solid var(--border-dark)", background: "var(--surface)" }}
    >
      <div className="flex flex-shrink-0 items-center gap-2 px-3 py-4">
        <button
          onClick={onToggle}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
          style={{ color: "var(--muted-light)" }}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <DynamicIcon name={collapsed ? "PanelLeftOpen" : "PanelLeftClose"} size={18} />
        </button>

        <AnimatePresence>
          {!collapsed && (
            <motion.button
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              onClick={onNewChat}
              className="accent-chip flex flex-1 items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold"
            >
              <DynamicIcon name="Plus" size={15} />
              New
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {collapsed && (
        <div className="flex flex-shrink-0 justify-center px-3 pb-3">
          <button
            onClick={onNewChat}
            className="flex h-9 w-9 items-center justify-center rounded-lg"
            style={{ background: "var(--accent-pale)", color: "var(--accent)" }}
            title="New chat"
          >
            <DynamicIcon name="Plus" size={16} />
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-2 pb-3">
        {sessions.length === 0 && !collapsed && (
          <p className="muted px-3 py-4 text-xs">No conversations yet</p>
        )}
        {sessions.map((session) => (
          <SessionRow
            key={session.id}
            session={session}
            active={session.id === activeSessionId}
            collapsed={collapsed}
            onClick={() => onSelectSession(session.id)}
          />
        ))}
      </div>
    </motion.div>
  );
}

function SessionRow({
  session,
  active,
  collapsed,
  onClick,
}: {
  session: ChatSession;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="mb-1 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors"
      style={{
        background: active ? "rgba(183, 217, 107, 0.10)" : "transparent",
        border: active ? "1px solid rgba(183, 217, 107, 0.22)" : "1px solid transparent",
        color: active ? "var(--text-light)" : "var(--muted-light)",
      }}
    >
      <span
        className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
        style={{
          background: active ? "var(--accent)" : "rgba(245,246,241,0.25)",
          boxShadow: active ? "0 0 5px rgba(183,217,107,0.45)" : "none",
        }}
      />
      {!collapsed && <span className="truncate">{session.title}</span>}
    </button>
  );
}