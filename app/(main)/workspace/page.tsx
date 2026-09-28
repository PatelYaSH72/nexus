"use client";

import { motion } from "framer-motion";
import { overviewHeader } from "@/data/overviewContent";
import { DocumentsPanel } from "@/components/documents/DocumentsPanel";
import { OverviewPanel } from "@/components/overview/OverviewPanel";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function HomePage() {
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
        className="relative flex w-full flex-col px-6 py-10 md:px-12"
      >
        {/* Greeting */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="m-0 text-[28px] font-semibold">
            {overviewHeader.greeting}, {overviewHeader.userName}
          </h1>
          <p className="muted mt-1.5 text-[15px]">{overviewHeader.subtitle}</p>
        </motion.div>

        {/* Two stacked cards — Documents hero (75%), Overview support (50%) */}
        <div className="flex flex-col gap-8">
          <DocumentsPanel className="h-[75vh]" />
          <OverviewPanel className="h-[75vh]" />
        </div>
      </motion.div>
    </div>
  );
}