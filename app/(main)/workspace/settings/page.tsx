"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DynamicIcon } from "@/lib/icon";
import {
  getSettings,
  updateSettings,
  resetSettings,
  type SettingsData,
  type UpdateSettingsPayload,
} from "@/lib/api";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function formatLastUpdated(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const datePart = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const timePart = d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return `${datePart}, ${timePart}`;
  } catch {
    return "";
  }
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const [form, setForm] = useState<SettingsData | null>(null);
  const [original, setOriginal] = useState<SettingsData | null>(null);

  const [toggleError, setToggleError] = useState<string | null>(null);

  const fetchSettingsData = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await getSettings();
      setForm(data);
      setOriginal(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setLoadError(err.message);
      } else {
        setLoadError("Failed to load settings.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettingsData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <DynamicIcon name="Loader2" size={28} className="animate-spin text-[#B7D96B]" />
        <p className="muted text-sm font-medium">Loading settings...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400">
          <DynamicIcon name="AlertCircle" size={24} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-red-400">Failed to load settings</h2>
          <p className="muted text-xs mt-1">{loadError}</p>
        </div>
        <button
          onClick={fetchSettingsData}
          className="accent-chip px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!form || !original) return null;

  const isDirty =
    form.system_prompt !== original.system_prompt ||
    form.semantic_search_enabled !== original.semantic_search_enabled ||
    form.keyword_search_enabled !== original.keyword_search_enabled ||
    form.reranker_model !== original.reranker_model ||
    form.llm_model !== original.llm_model;

  const promptValid =
    form.system_prompt.trim().length > 0 && form.system_prompt.length <= 8000;

  const canSave = isDirty && promptValid && !saving && !resetting;

  const handleToggle = (which: "semantic" | "keyword") => {
    setToggleError(null);
    setActionError(null);

    const nextSemantic =
      which === "semantic" ? !form.semantic_search_enabled : form.semantic_search_enabled;
    const nextKeyword =
      which === "keyword" ? !form.keyword_search_enabled : form.keyword_search_enabled;

    if (!nextSemantic && !nextKeyword) {
      setToggleError("Kam se kam ek search method ON rakho");
      return;
    }

    setForm({
      ...form,
      semantic_search_enabled: nextSemantic,
      keyword_search_enabled: nextKeyword,
    });
  };

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setActionError(null);
    setSaveSuccess(null);

    const payload: UpdateSettingsPayload = {
      system_prompt: form.system_prompt,
      semantic_search_enabled: form.semantic_search_enabled,
      keyword_search_enabled: form.keyword_search_enabled,
      reranker_model: form.reranker_model,
      llm_model: form.llm_model,
    };

    try {
      const updated = await updateSettings(payload);
      setForm(updated);
      setOriginal(updated);
      setSaveSuccess("Saved successfully!");
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setActionError(err.message);
      } else {
        setActionError("Something went wrong");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    const confirmed = window.confirm("Reset all settings to default?");
    if (!confirmed) return;

    setResetting(true);
    setActionError(null);
    setSaveSuccess(null);

    try {
      const resetData = await resetSettings();
      setForm(resetData);
      setOriginal(resetData);
      setSaveSuccess("Settings reset to defaults!");
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setActionError(err.message);
      } else {
        setActionError("Failed to reset settings");
      }
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="section-dark relative min-h-screen w-full overflow-hidden pb-12">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-[200px] -right-[200px] h-[500px] w-[500px] blur-[10px]"
        style={{
          background:
            "radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)",
        }}
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative mx-auto flex w-full max-w-[780px] flex-col gap-6 px-6 py-10 md:px-0"
      >
        <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="m-0 text-[28px] font-semibold tracking-tight">Settings</h1>
            {form.updated_at && (
              <p className="muted mt-1 text-xs">
                Last updated: {formatLastUpdated(form.updated_at)}
              </p>
            )}
          </div>
          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
            >
              <DynamicIcon name="Check" size={14} />
              <span>{saveSuccess}</span>
            </motion.div>
          )}
        </motion.div>

        {actionError && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-medium"
          >
            <DynamicIcon name="AlertCircle" size={16} className="shrink-0" />
            <span>{actionError}</span>
          </motion.div>
        )}

        {/* Section 1: System Prompt */}
        <motion.div
          variants={itemVariants}
          className="surface rounded-2xl p-6 flex flex-col gap-3"
          style={{
            border: "1px solid var(--border-dark)",
            boxShadow:
              "0 0 0 1px rgba(183, 217, 107, 0.03), 0 0 24px rgba(183, 217, 107, 0.04)",
          }}
        >
          <div>
            <h2 className="text-base font-semibold text-white">System Prompt</h2>
            <p className="muted mt-0.5 text-xs">
              Controls how the assistant behaves when answering questions from your documents.
            </p>
          </div>

          <textarea
            rows={8}
            value={form.system_prompt}
            onChange={(e) => setForm({ ...form, system_prompt: e.target.value })}
            placeholder="Type your system prompt here..."
            className="w-full resize-y rounded-xl px-4 py-3 text-sm leading-relaxed outline-none transition-colors"
            style={{
              background: "var(--base)",
              border: "1px solid var(--border-dark)",
              color: "var(--text-light)",
            }}
            onFocus={(e) =>
              (e.currentTarget.style.borderColor = "rgba(183, 217, 107, 0.4)")
            }
            onBlur={(e) =>
              (e.currentTarget.style.borderColor = "var(--border-dark)")
            }
          />

          <div className="flex items-center justify-between text-xs">
            {form.system_prompt.length > 8000 ? (
              <span className="text-red-400 font-medium">
                System prompt cannot exceed 8000 characters.
              </span>
            ) : form.system_prompt.trim().length === 0 ? (
              <span className="text-red-400 font-medium">
                System prompt cannot be empty.
              </span>
            ) : (
              <span className="muted">Max 8000 characters.</span>
            )}
            <span
              className={`font-mono ${
                form.system_prompt.length > 8000
                  ? "text-red-400 font-semibold"
                  : "muted"
              }`}
            >
              {form.system_prompt.length} / 8000
            </span>
          </div>
        </motion.div>

        {/* Section 2: Retrieval */}
        <motion.div
          variants={itemVariants}
          className="surface rounded-2xl p-6 flex flex-col gap-4"
          style={{
            border: "1px solid var(--border-dark)",
            boxShadow:
              "0 0 0 1px rgba(183, 217, 107, 0.03), 0 0 24px rgba(183, 217, 107, 0.04)",
          }}
        >
          <div>
            <h2 className="text-base font-semibold text-white">Retrieval</h2>
            <p className="muted mt-0.5 text-xs">
              Configure search methods for finding relevant document chunks. At least one method must stay enabled.
            </p>
          </div>

          <div className="flex flex-col gap-4 pt-1">
            <ToggleRow
              label="Semantic Search"
              description="Uses vector embeddings to match contextual meaning in query and documents."
              checked={form.semantic_search_enabled}
              onChange={() => handleToggle("semantic")}
            />
            <div className="h-[1px] bg-white/5" />
            <ToggleRow
              label="Keyword Search"
              description="Uses BM25 keyword matching for exact word and phrase queries."
              checked={form.keyword_search_enabled}
              onChange={() => handleToggle("keyword")}
            />
          </div>

          {toggleError && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-1.5 text-xs text-red-400 font-medium mt-1"
            >
              <DynamicIcon name="AlertCircle" size={14} />
              <span>{toggleError}</span>
            </motion.p>
          )}
        </motion.div>

        {/* Section 3: Models */}
        <motion.div
          variants={itemVariants}
          className="surface rounded-2xl p-6 flex flex-col gap-5"
          style={{
            border: "1px solid var(--border-dark)",
            boxShadow:
              "0 0 0 1px rgba(183, 217, 107, 0.03), 0 0 24px rgba(183, 217, 107, 0.04)",
          }}
        >
          <div>
            <h2 className="text-base font-semibold text-white">Models in Use</h2>
            <p className="muted mt-0.5 text-xs">
              Model parameters for embedding, reranking, and generation.
            </p>
          </div>

          <div className="flex flex-col gap-4 text-sm">
            {/* Embedding Model */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold muted">Embedding Model (Read-only)</label>
              <div
                className="w-full rounded-xl px-4 py-2.5 text-xs font-mono border flex items-center justify-between"
                style={{
                  background: "rgba(255, 255, 255, 0.02)",
                  borderColor: "var(--border-dark)",
                  color: "var(--text-light)",
                }}
              >
                <span>{form.embedding_model}</span>
                <span className="text-[10px] uppercase font-sans font-semibold px-2 py-0.5 rounded bg-white/10 text-white/50">
                  Fixed
                </span>
              </div>
              <p className="text-[11px] text-amber-400/80 flex items-center gap-1">
                <DynamicIcon name="Info" size={12} />
                <span>Badalne se purane documents ki search kharab ho jayegi</span>
              </p>
            </div>

            {/* Reranker Model */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold muted">Reranker Model</label>
              <select
                value={form.reranker_model}
                onChange={(e) => setForm({ ...form, reranker_model: e.target.value })}
                className="w-full rounded-xl px-3.5 py-2 text-xs font-mono outline-none cursor-pointer transition-colors"
                style={{
                  background: "var(--base)",
                  border: "1px solid var(--border-dark)",
                  color: "var(--text-light)",
                }}
              >
                <option value="cross-encoder/ms-marco-MiniLM-L-6-v2">
                  cross-encoder/ms-marco-MiniLM-L-6-v2
                </option>
              </select>
            </div>

            {/* LLM Provider */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold muted">LLM Provider (Read-only)</label>
              <div
                className="w-full rounded-xl px-4 py-2.5 text-xs font-mono border flex items-center justify-between"
                style={{
                  background: "rgba(255, 255, 255, 0.02)",
                  borderColor: "var(--border-dark)",
                  color: "var(--text-light)",
                }}
              >
                <span className="capitalize">{form.llm_provider || "groq"}</span>
                <span className="text-[10px] uppercase font-sans font-semibold px-2 py-0.5 rounded bg-white/10 text-white/50">
                  Default
                </span>
              </div>
            </div>

            {/* LLM Model */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold muted">LLM Model</label>
              <select
                value={form.llm_model}
                onChange={(e) => setForm({ ...form, llm_model: e.target.value })}
                className="w-full rounded-xl px-3.5 py-2 text-xs font-mono outline-none cursor-pointer transition-colors"
                style={{
                  background: "var(--base)",
                  border: "1px solid var(--border-dark)",
                  color: "var(--text-light)",
                }}
              >
                <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile</option>
                <option value="llama-3.1-8b-instant">llama-3.1-8b-instant</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Action Controls Bar */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between gap-4 pt-2"
        >
          <button
            onClick={handleReset}
            disabled={resetting || saving}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
            style={{
              border: "1px solid var(--border-dark)",
              color: "var(--muted-light)",
            }}
          >
            {resetting ? (
              <>
                <DynamicIcon name="Loader2" size={14} className="animate-spin" />
                <span>Resetting...</span>
              </>
            ) : (
              <>
                <DynamicIcon name="RotateCcw" size={14} />
                <span>Reset to defaults</span>
              </>
            )}
          </button>

          <button
            onClick={handleSave}
            disabled={!canSave}
            className="accent-chip flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {saving ? (
              <>
                <DynamicIcon name="Loader2" size={14} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <DynamicIcon name="Save" size={14} />
                <span>Save changes</span>
              </>
            )}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="muted text-xs mt-0.5">{description}</p>
      </div>
      <button
        onClick={onChange}
        type="button"
        className="relative flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors cursor-pointer"
        style={{
          background: checked ? "var(--accent)" : "rgba(255, 255, 255, 0.12)",
          boxShadow: checked ? "0 0 10px rgba(183, 217, 107, 0.35)" : "none",
        }}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="h-5 w-5 rounded-full"
          style={{
            background: checked ? "var(--accent-ink)" : "#ffffff",
            marginLeft: checked ? "auto" : "0",
          }}
        />
      </button>
    </div>
  );
}