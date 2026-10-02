"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { StatCard } from "./StatCard";
import { ActivityRow } from "./ActivityRow";
import { SystemStatusPill } from "./SystemStatusPill";
import {
  getWorkspaceStats,
  type WorkspaceStatsData,
} from "@/lib/api";
import { DynamicIcon } from "@/lib/icon";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function OverviewPanel({ className = "" }: { className?: string }) {
  const [stats, setStats] = useState<WorkspaceStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getWorkspaceStats();
      setStats(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load workspace overview stats.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statCardsData = [
    {
      id: "total_docs",
      label: "Total Documents",
      value: stats ? String(stats.total_documents) : "0",
      trend: stats ? `${stats.ready_documents} ready to search` : "Loading...",
      icon: "FileText",
    },
    {
      id: "ready_docs",
      label: "Ready to Search",
      value: stats ? String(stats.ready_documents) : "0",
      trend: stats && stats.processing_documents > 0 ? `${stats.processing_documents} processing...` : "Vector indexed",
      icon: "CheckCircle2",
    },
    {
      id: "conversations",
      label: "Conversations",
      value: stats ? String(stats.total_conversations) : "0",
      trend: stats ? `${stats.total_messages} messages` : "Loading...",
      icon: "MessageSquare",
    },
    {
      id: "response_time",
      label: "Avg Response Time",
      value: stats ? stats.avg_response_time : "1.2s",
      trend: "Groq Llama / Qwen",
      icon: "Zap",
    },
  ];

  const recentActivityList = stats?.recent_activity?.length
    ? stats.recent_activity.map((item) => ({
        id: item.id,
        type: (item.type === "query" ? "chat" : "upload") as "chat" | "upload",
        title: item.title,
        subtitle: item.subtitle || "",
        timestamp: item.timestamp,
        href: item.type === "query" ? "/workspace/search" : "/workspace/documents",
      }))
    : [
        {
          id: "act-fallback-1",
          type: "upload" as const,
          title: "No recent activity yet",
          subtitle: "Upload a document to get started",
          timestamp: "Just now",
          href: "/workspace/documents",
        },
      ];

  const systemStatusList = stats?.system_status?.length
    ? stats.system_status.map((item) => ({
        id: item.id,
        label: `${item.name} (${item.latency})`,
        status: (item.status === "online" ? "operational" : item.status === "degraded" ? "degraded" : "down") as "operational" | "degraded" | "down",
      }))
    : [
        { id: "db", label: "PostgreSQL Database (4ms)", status: "operational" as const },
        { id: "qdrant", label: "Qdrant Vector Store (12ms)", status: "operational" as const },
        { id: "groq", label: "Groq LLM Engine (140ms)", status: "operational" as const },
      ];

  return (
    <motion.div
      variants={itemVariants}
      className={`surface flex flex-col overflow-hidden rounded-2xl ${className}`}
      style={{
        border: "1px solid var(--border-dark)",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.02)",
      }}
    >
      <div className="flex flex-shrink-0 items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid var(--border-dark)" }}>
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold">Overview</h2>
          {loading && <DynamicIcon name="Loader2" size={14} className="animate-spin muted" />}
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="muted hover:text-white flex items-center gap-1.5 text-xs transition-colors cursor-pointer"
        >
          <DynamicIcon name="RefreshCw" size={12} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error ? (
        <div className="flex flex-1 items-center justify-center p-6 text-sm text-red-400">
          {error}
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-6 px-6 py-5" style={{ minHeight: 0 }}>
          {/* Stat cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-shrink-0 flex-wrap gap-4"
          >
            {statCardsData.map((stat) => (
              <StatCard key={stat.id} stat={stat} />
            ))}
          </motion.div>

          {/* Activity + status split */}
          <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-[1fr_260px]" style={{ minHeight: 0 }}>
            <div className="flex flex-col" style={{ minHeight: 0 }}>
              <h3 className="muted mb-2 flex-shrink-0 text-xs font-semibold uppercase tracking-wide">
                Recent Activity
              </h3>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex-1 overflow-y-auto pr-1"
                style={{ minHeight: 0 }}
              >
                {recentActivityList.map((item, i) => (
                  <ActivityRow
                    key={item.id}
                    item={item}
                    isLast={i === recentActivityList.length - 1}
                  />
                ))}
              </motion.div>
            </div>

            <div className="flex-shrink-0">
              <h3 className="muted mb-2 text-xs font-semibold uppercase tracking-wide">
                System Status
              </h3>
              <div className="flex flex-col gap-3">
                {systemStatusList.map((item) => (
                  <SystemStatusPill key={item.id} item={item} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}