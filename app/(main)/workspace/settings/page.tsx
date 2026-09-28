"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DynamicIcon } from "@/lib/icon";

const DEFAULT_SYSTEM_PROMPT =
  "You are a helpful assistant that answers questions strictly based on the provided document context. Always cite the source page when giving an answer. If the answer isn't in the documents, say so clearly instead of guessing.";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function SettingsPage() {
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
  const [savedPrompt, setSavedPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
  const [semanticSearch, setSemanticSearch] = useState(true);
  const [keywordSearch, setKeywordSearch] = useState(true);
  const [toggleError, setToggleError] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved">("idle");

  const isDirty = systemPrompt !== savedPrompt;

  const handleSave = () => {
    setSavedPrompt(systemPrompt);
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 1800);
  };

  const handleReset = () => {
    setSystemPrompt(DEFAULT_SYSTEM_PROMPT);
    setSavedPrompt(DEFAULT_SYSTEM_PROMPT);
  };

  const handleToggle = (which: "semantic" | "keyword") => {
    const nextSemantic = which === "semantic" ? !semanticSearch : semanticSearch;
    const nextKeyword = which === "keyword" ? !keywordSearch : keywordSearch;

    if (!nextSemantic && !nextKeyword) {
      setToggleError(true);
      return;
    }

    setToggleError(false);
    if (which === "semantic") setSemanticSearch(nextSemantic);
    else setKeywordSearch(nextKeyword);
  };

  return (
    <div className="section-dark relative min-h-screen w-full overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-[200px] -right-[200px] h-[500px] w-[500px] blur-[10px]"
        style={{ background: "radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)" }}
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative mx-auto flex w-full max-w-[760px] flex-col gap-8 px-6 py-10 md:px-0"
      >
        <motion.h1 variants={itemVariants} className="m-0 text-[28px] font-semibold">
          Settings
        </motion.h1>

        {/* System Prompt */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl p-6"
          style={{ background: "var(--surface)", border: "1px solid var(--border-dark)" }}
        >
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-base font-semibold">System Prompt</h2>
            {saveStatus === "saved" && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-1.5 text-xs"
                style={{ color: "var(--accent)" }}
              >
                <DynamicIcon name="Check" size={13} />
                Saved
              </motion.span>
            )}
          </div>
          <p className="muted mb-4 text-xs">
            Controls how the assistant behaves when answering from your documents.
          </p>

          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            rows={5}
            className="w-full resize-none rounded-xl px-4 py-3 text-sm leading-relaxed outline-none"
            style={{
              background: "var(--base)",
              border: "1px solid var(--border-dark)",
              color: "var(--text-light)",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(183, 217, 107, 0.4)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-dark)")}
          />

          <div className="mt-4 flex items-center justify-end gap-3">
            <button
              onClick={handleReset}
              className="rounded-lg px-4 py-2 text-sm font-medium"
              style={{ border: "1px solid var(--border-dark)", color: "var(--muted-light)" }}
            >
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={!isDirty}
              className="accent-chip rounded-lg px-4 py-2 text-sm font-semibold"
              style={{ opacity: isDirty ? 1 : 0.5, cursor: isDirty ? "pointer" : "default" }}
            >
              Save
            </button>
          </div>
        </motion.div>

        {/* Retrieval */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl p-6"
          style={{ background: "var(--surface)", border: "1px solid var(--border-dark)" }}
        >
          <h2 className="mb-1 text-base font-semibold">Retrieval</h2>
          <p className="muted mb-4 text-xs">At least one retrieval method must stay enabled.</p>

          <div className="flex flex-wrap gap-8">
            <ToggleRow
              label="Semantic Search"
              checked={semanticSearch}
              onChange={() => handleToggle("semantic")}
            />
            <ToggleRow
              label="Keyword Search"
              checked={keywordSearch}
              onChange={() => handleToggle("keyword")}
            />
          </div>

          {toggleError && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center gap-1.5 text-xs"
              style={{ color: "#C25B4D" }}
            >
              <DynamicIcon name="AlertCircle" size={13} />
              At least one search method must be enabled.
            </motion.p>
          )}
        </motion.div>

        {/* Models in use */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl p-6"
          style={{ background: "var(--surface)", border: "1px solid var(--border-dark)" }}
        >
          <h2 className="mb-4 text-base font-semibold">Models in use</h2>
          <div className="flex flex-col gap-3 text-sm">
            <ModelRow label="Embedding" value="BAAI/bge-small-en-v1.5" />
            <ModelRow label="Reranker" value="cross-encoder/ms-marco-MiniLM-L-6-v2" />
            <ModelRow label="LLM" value="Groq — llama-3.3-70b-versatile" />
          </div>
        </motion.div>

        {/* Account */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between rounded-2xl p-6"
          style={{ background: "var(--surface)", border: "1px solid var(--border-dark)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold"
              style={{ background: "var(--accent-pale)", color: "var(--accent)" }}
            >
              AK
            </div>
            <div>
              <p className="text-sm font-medium">Alex Kumar</p>
              <p className="muted text-xs">alex@company.com</p>
            </div>
          </div>

          <button
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium"
            style={{ border: "1px solid var(--border-dark)", color: "var(--muted-light)" }}
          >
            <DynamicIcon name="LogOut" size={15} />
            Log out
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button onClick={onChange} className="flex items-center gap-3">
      <span
        className="relative flex h-6 w-11 flex-shrink-0 items-center rounded-full px-0.5"
        style={{
          background: checked ? "var(--accent)" : "rgba(245, 246, 241, 0.12)",
          boxShadow: checked ? "0 0 10px rgba(183, 217, 107, 0.35)" : "none",
          transition: "background 0.2s ease, box-shadow 0.2s ease",
        }}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="h-5 w-5 rounded-full"
          style={{
            background: checked ? "var(--accent-ink)" : "var(--text-light)",
            marginLeft: checked ? "auto" : 0,
          }}
        />
      </span>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

function ModelRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="muted">{label}</span>
      <span className="font-mono text-xs" style={{ color: "var(--text-light)" }}>
        {value}
      </span>
    </div>
  );
}