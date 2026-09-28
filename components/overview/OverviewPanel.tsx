"use client";

import { motion } from "framer-motion";
import {
  statCards,
  recentActivity,
  systemStatus,
} from "@/data/overviewContent";
import { StatCard } from "./StatCard";
import { ActivityRow } from "./ActivityRow";
import { SystemStatusPill } from "./SystemStatusPill";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function OverviewPanel({ className = "" }: { className?: string }) {
  return (
    <motion.div
      variants={itemVariants}
      className={`surface flex flex-col overflow-hidden rounded-2xl ${className}`}
      style={{
        border: "1px solid var(--border-dark)",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.02)",
      }}
    >
      <div className="flex-shrink-0 px-6 py-5" style={{ borderBottom: "1px solid var(--border-dark)" }}>
        <h2 className="text-base font-semibold">Overview</h2>
      </div>

      {/* No scroll on this wrapper — it fills the fixed panel height */}
      <div className="flex flex-1 flex-col gap-6 px-6 py-5" style={{ minHeight: 0 }}>
        {/* Stat cards — fixed, never scrolls */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-shrink-0 flex-wrap gap-4"
        >
          {statCards.map((stat) => (
            <StatCard key={stat.id} stat={stat} />
          ))}
        </motion.div>

        {/* Activity + status split — this row takes remaining space */}
        <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-[1fr_240px]" style={{ minHeight: 0 }}>
          <div className="flex flex-col" style={{ minHeight: 0 }}>
            <h3 className="muted mb-2 flex-shrink-0 text-xs font-semibold uppercase tracking-wide">
              Recent Activity
            </h3>
            {/* Only this list scrolls, if content overflows */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex-1 overflow-y-auto pr-1"
              style={{ minHeight: 0 }}
            >
              {recentActivity.map((item, i) => (
                <ActivityRow
                  key={item.id}
                  item={item}
                  isLast={i === recentActivity.length - 1}
                />
              ))}
            </motion.div>
          </div>

          <div className="flex-shrink-0">
            <h3 className="muted mb-2 text-xs font-semibold uppercase tracking-wide">
              System Status
            </h3>
            <div className="flex flex-col gap-3">
              {systemStatus.map((item) => (
                <SystemStatusPill key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}