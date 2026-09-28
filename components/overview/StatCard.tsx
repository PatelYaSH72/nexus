"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DynamicIcon } from "@/lib/icon";
import type { StatCard as StatCardData } from "@/data/overviewContent";

const itemVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

export function StatCard({ stat }: { stat: StatCardData }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="surface stat-card"
      style={{
        borderRadius: 14,
        padding: "18px 20px",
        flex: "1 1 220px",
        minWidth: 200,
        position: "relative",
        overflow: "hidden",
        border: hovered
          ? "1px solid rgba(183, 217, 107, 0.32)"
          : "1px solid rgba(183, 217, 107, 0.18)",
        boxShadow: hovered
          ? "0 0 0 1px rgba(183, 217, 107, 0.06), 0 0 20px rgba(183, 217, 107, 0.16)"
          : "0 0 0 1px rgba(183, 217, 107, 0.04), 0 0 12px rgba(183, 217, 107, 0.10)",
        transition: "border-color 0.25s ease, box-shadow 0.25s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <DynamicIcon name={stat.icon} size={16} className="muted" />
        <span className="muted" style={{ fontSize: 13 }}>
          {stat.label}
        </span>
      </div>

      <div style={{ fontSize: 28, fontWeight: 600, lineHeight: 1.1, letterSpacing: "-0.01em" }}>
        {stat.value}
      </div>

      {stat.trend && (
        <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>
          {stat.trend}
        </div>
      )}
    </motion.div>
  );
}