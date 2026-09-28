"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { DynamicIcon } from "@/lib/icon";
import type { ActivityItem } from "@/data/overviewContent";

const itemVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

export function ActivityRow({ item, isLast }: { item: ActivityItem; isLast?: boolean }) {
  const [hovered, setHovered] = useState(false);
  const icon = item.type === "chat" ? "MessageSquare" : "Upload";

  return (
    <motion.div variants={itemVariants}>
      <Link
        href={item.href}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "14px 10px",
          margin: "0 -10px",
          borderRadius: 10,
          textDecoration: "none",
          color: "var(--text-light)",
          borderBottom: isLast ? "none" : "1px solid var(--border-dark)",
          background: hovered ? "rgba(183, 217, 107, 0.05)" : "transparent",
          boxShadow: hovered
            ? "0 0 0 1px rgba(183, 217, 107, 0.14)"
            : "0 0 0 1px transparent",
          transition: "background 0.2s ease, box-shadow 0.2s ease",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: hovered ? "rgba(183, 217, 107, 0.18)" : "var(--accent-pale)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: hovered ? "0 0 10px rgba(183, 217, 107, 0.14)" : "none",
            transition: "background 0.2s ease, box-shadow 0.2s ease",
          }}
        >
          <DynamicIcon name={icon} size={15} style={{ color: "var(--accent)" }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {item.title}
          </div>
          {item.subtitle && (
            <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
              {item.subtitle}
            </div>
          )}
        </div>

        <div className="muted" style={{ fontSize: 12, flexShrink: 0, whiteSpace: "nowrap" }}>
          {item.timestamp}
        </div>
      </Link>
    </motion.div>
  );
}