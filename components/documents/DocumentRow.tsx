"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DynamicIcon } from "@/lib/icon";
import { StatusBadge, type DocStatus } from "./StatusBadge";

export interface DocumentItem {
  id: string;
  name: string;
  status: DocStatus;
  step?: string;
  pages: number;
  uploaded: string;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function DocumentRow({
  doc,
  onView,
  onDelete,
  isDeleting = false,
}: {
  doc: DocumentItem;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      variants={itemVariants}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`grid grid-cols-[1fr_160px_70px_110px_130px] items-center gap-4 rounded-lg px-3 py-3 text-sm transition-all ${
        isDeleting ? "opacity-50 pointer-events-none" : ""
      }`}
      style={{
        background: hovered ? "rgba(183, 217, 107, 0.05)" : "transparent",
        boxShadow: hovered ? "0 0 0 1px rgba(183, 217, 107, 0.14)" : "0 0 0 1px transparent",
        transition: "background 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease",
      }}
    >
      <div className="flex items-center gap-2 truncate">
        <DynamicIcon name="FileText" size={15} className="muted flex-shrink-0" />
        <span className="truncate">{doc.name}</span>
      </div>
      <StatusBadge status={doc.status} step={doc.step} />
      <span className="muted">{doc.pages}</span>
      <span className="muted">{doc.uploaded}</span>
      <div className="flex items-center gap-3 text-xs">
        <button
          onClick={() => onView(doc.id)}
          disabled={isDeleting}
          className="font-medium hover:underline disabled:opacity-50"
          style={{ color: "var(--accent)" }}
        >
          View
        </button>
        <button
          onClick={() => onDelete(doc.id)}
          disabled={isDeleting}
          className="muted hover:text-current flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
        >
          {isDeleting ? (
            <>
              <DynamicIcon name="Loader2" size={13} className="animate-spin" />
              <span>Deleting...</span>
            </>
          ) : (
            "Delete"
          )}
        </button>
      </div>
    </motion.div>
  );
}