"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { DynamicIcon } from "@/lib/icon";
import type { QuickAction } from "@/data/overviewContent";

const itemVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

export function QuickActionButton({ action, primary }: { action: QuickAction; primary?: boolean }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div variants={itemVariants} whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.98 }}>
      <Link
        href={action.href}
        className={primary ? "accent-chip" : ""}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 20px",
          borderRadius: 10,
          fontSize: 14,
          fontWeight: 600,
          textDecoration: "none",
          border: primary
            ? "none"
            : hovered
            ? "1px solid rgba(183, 217, 107, 0.32)"
            : "1px solid rgba(183, 217, 107, 0.18)",
          background: primary ? undefined : "transparent",
          color: primary ? undefined : "var(--text-light)",
          boxShadow: primary
            ? "none"
            : hovered
            ? "0 0 14px rgba(183, 217, 107, 0.14)"
            : "0 0 8px rgba(183, 217, 107, 0.06)",
          transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        }}
      >
        <DynamicIcon name={action.icon} size={16} />
        {action.label}
      </Link>
    </motion.div>
  );
}