import type { SystemStatusItem } from "@/data/overviewContent";

const STATUS_COLOR: Record<SystemStatusItem["status"], string> = {
  operational: "var(--accent)",
  degraded: "#D9A54B",
  down: "#C25B4D",
};

const STATUS_GLOW: Record<SystemStatusItem["status"], string> = {
  operational: "rgba(183, 217, 107, 0.45)",
  degraded: "rgba(217, 165, 75, 0.4)",
  down: "rgba(194, 91, 77, 0.4)",
};

export function SystemStatusPill({ item }: { item: SystemStatusItem }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: STATUS_COLOR[item.status],
          boxShadow: `0 0 6px ${STATUS_GLOW[item.status]}`,
        }}
      />
      <span className="muted" style={{ fontSize: 12 }}>
        {item.label}
      </span>
    </div>
  );
}