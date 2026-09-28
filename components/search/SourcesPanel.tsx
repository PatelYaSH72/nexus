"use client";

import { motion, AnimatePresence } from "framer-motion";
import { DynamicIcon } from "@/lib/icon";

export interface SourceDoc {
  id: string;
  name: string;
  usedInConversation?: boolean;
}

const sources: SourceDoc[] = [
  { id: "1", name: "policy.pdf", usedInConversation: true },
  { id: "2", name: "handbook_2026.pdf", usedInConversation: true },
  { id: "3", name: "legal_contract_v3.pdf" },
];

export function SourcesPanel({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.div
      animate={{ width: collapsed ? 0 : 240 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="flex h-full flex-shrink-0 flex-col overflow-hidden"
      style={{ borderLeft: collapsed ? "none" : "1px solid var(--border-dark)", background: "var(--surface)" }}
    >
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex h-full flex-col"
          >
            <div
              className="flex flex-shrink-0 items-center justify-between px-4 py-4"
              style={{ borderBottom: "1px solid var(--border-dark)" }}
            >
              <h3 className="text-sm font-semibold">Sources</h3>
              <button onClick={onToggle} style={{ color: "var(--muted-light)" }}>
                <DynamicIcon name="PanelRightClose" size={17} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-3">
              <p className="muted mb-2 px-1 text-[11px] font-semibold uppercase tracking-wide">
                Used in this conversation
              </p>
              {sources
                .filter((s) => s.usedInConversation)
                .map((doc) => (
                  <SourceRow key={doc.id} doc={doc} />
                ))}

              <p className="muted mb-2 mt-5 px-1 text-[11px] font-semibold uppercase tracking-wide">
                All documents
              </p>
              {sources
                .filter((s) => !s.usedInConversation)
                .map((doc) => (
                  <SourceRow key={doc.id} doc={doc} />
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SourceRow({ doc }: { doc: SourceDoc }) {
  return (
    <button
      className="mb-1 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm"
      style={{ background: "transparent" }}
    >
      <div
        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md"
        style={{ background: "var(--accent-pale)" }}
      >
        <DynamicIcon name="FileText" size={13} style={{ color: "var(--accent)" }} />
      </div>
      <span className="muted truncate">{doc.name}</span>
    </button>
  );
}