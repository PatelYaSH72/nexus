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

export function StatusBadge({ status }: { status: DocStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: cfg.color, boxShadow: `0 0 5px ${cfg.glow}` }}
      />
      {cfg.label}
    </span>
  );
}