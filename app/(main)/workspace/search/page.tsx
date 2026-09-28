"use client";

import { useState } from "react";
import { useChat } from "@/hooks/useChat";
import { ChatSidebar } from "@/components/search/ChatSidebar";
import { ChatWindow } from "@/components/search/ChatWindow";
import { SourcesPanel } from "@/components/search/SourcesPanel";

export default function SearchPage() {
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  const { sessions, activeSession, activeSessionId, isStreaming, createSession, selectSession, sendMessage } =
    useChat();

  return (
    <div className="section-dark flex h-[95vh] w-full overflow-hidden">
      <ChatSidebar
        collapsed={leftCollapsed}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onToggle={() => setLeftCollapsed((c) => !c)}
        onNewChat={createSession}
        onSelectSession={selectSession}
      />

      <ChatWindow
        session={activeSession}
        isStreaming={isStreaming}
        leftCollapsed={leftCollapsed}
        rightCollapsed={rightCollapsed}
        onToggleLeft={() => setLeftCollapsed((c) => !c)}
        onToggleRight={() => setRightCollapsed((c) => !c)}
        onSend={sendMessage}
      />

      <SourcesPanel collapsed={rightCollapsed} onToggle={() => setRightCollapsed((c) => !c)} />
    </div>
  );
}