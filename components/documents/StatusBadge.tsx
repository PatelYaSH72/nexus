"use client";

import { motion } from "framer-motion";
import { DynamicIcon } from "@/lib/icon";

export type DocStatus = "ready" | "processing" | "failed" | "needs_ocr";

const STATUS_CONFIG: Record<DocStatus, { label: string; color: string; glow: string; bg: string }> = {
  ready: {
    label: "Ready",
    color: "var(--accent)",
    glow: "rgba(183, 217, 107, 0.35)",
    bg: "rgba(183, 217, 107, 0.10)",
  },
  processing: {
    label: "Processing",
    color: "#D9A54B",
    glow: "rgba(217, 165, 75, 0.35)",
    bg: "rgba(217, 165, 75, 0.10)",
  },
  needs_ocr: {
    label: "Needs OCR",
    color: "#7FA8D9",
    glow: "rgba(127, 168, 217, 0.35)",
    bg: "rgba(127, 168, 217, 0.10)",
  },
  failed: {
    label: "Failed",
    color: "#C25B4D",
    glow: "rgba(194, 91, 77, 0.35)",
    bg: "rgba(194, 91, 77, 0.10)",
  },
};

export function StatusBadge({ status, step }: { status: DocStatus; step?: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.processing;
  const isProcessing = status === "processing";

  return (
    <motion.span
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium max-w-[170px] truncate"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {isProcessing ? (
        <DynamicIcon name="Loader2" size={11} className="animate-spin flex-shrink-0" />
      ) : (
        <motion.span
          animate={isProcessing ? { opacity: [0.4, 1, 0.4] } : { opacity: 1 }}
          transition={isProcessing ? { repeat: Infinity, duration: 1.2 } : {}}
          className="h-1.5 w-1.5 rounded-full flex-shrink-0"
          style={{ background: cfg.color, boxShadow: `0 0 6px ${cfg.glow}` }}
        />
      )}
      <span className="truncate">{step || cfg.label}</span>
    </motion.span>
  );
}