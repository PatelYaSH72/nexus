"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { DynamicIcon } from "@/lib/icon";
import { StatusBadge } from "@/components/documents/StatusBadge";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const pages = [
  {
    page: 3,
    text: "Employees are entitled to ",
    chunk: "26 weeks of paid maternity leave",
    after: " under the current policy.",
  },
  {
    page: 4,
    text: "This leave applies to all full-time staff who have completed ",
    chunk: "at least six months",
    after: " of continuous employment.",
  },
];

export default function DocumentDetailPage({ params }: { params: { id: string } }) {
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
        className="relative w-full px-6 py-10 md:px-12"
      >
        <motion.div variants={itemVariants} className="muted mb-1 flex items-center gap-2 text-sm">
          <Link href="/" className="hover:underline">
            Documents
          </Link>
          <span>/</span>
          <span className="text-current">policy.pdf</span>
        </motion.div>

        <motion.h1 variants={itemVariants} className="mb-4 text-[24px] font-semibold">
          policy.pdf
        </motion.h1>

        <motion.div variants={itemVariants} className="mb-10 flex flex-wrap items-center gap-3 text-sm">
          <StatusBadge status="ready" />
          <span className="muted">12 pages</span>
          <span className="muted">·</span>
          <span className="muted">Uploaded Sep 20</span>
          <span className="muted">·</span>
          <span className="muted">84 chunks</span>
        </motion.div>

        <motion.div variants={containerVariants} className="flex flex-col gap-8">
          {pages.map((p) => (
            <motion.div key={p.page} variants={itemVariants}>
              <div className="muted mb-2 flex items-center gap-2 text-xs font-medium">
                <DynamicIcon name="FileText" size={13} />
                Page {p.page}
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-light)" }}>
                {p.text}
                <span
                  className="rounded px-1 py-0.5"
                  style={{
                    background: "var(--accent-pale)",
                    boxShadow: "0 0 0 1px rgba(183, 217, 107, 0.25)",
                  }}
                >
                  {p.chunk}
                </span>
                {p.after}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}