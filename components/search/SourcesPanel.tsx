"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { DynamicIcon } from "@/lib/icon";
import { getDocuments, type ApiDocument, type ApiMessage } from "@/lib/api";

interface SourcesPanelProps {
  collapsed: boolean;
  onToggle: () => void;
  messages: ApiMessage[];
}

interface UsedDocument {
  document_id: string | number;
  filename: string;
  pages: number[];
}

export function SourcesPanel({
  collapsed,
  onToggle,
  messages,
}: SourcesPanelProps) {
  const [documents, setDocuments] = useState<ApiDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const docs = await getDocuments();
      setDocuments(docs);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to fetch documents";
      if (errorMsg !== "Unauthorized") {
        setError(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const usedDocuments = useMemo(() => {
    if (!messages || !Array.isArray(messages)) return [];

    const docMap = new Map<
      string,
      { document_id: string | number; filename: string; pagesSet: Set<number> }
    >();

    for (const msg of messages) {
      if (msg.role === "assistant" && Array.isArray(msg.sources)) {
        for (const src of msg.sources) {
          if (!src || src.document_id === undefined || src.document_id === null)
            continue;

          const docIdStr = String(src.document_id);
          const existing = docMap.get(docIdStr);

          if (existing) {
            if (typeof src.page === "number") {
              existing.pagesSet.add(src.page);
            }
            if (
              src.filename &&
              (!existing.filename || existing.filename.startsWith("Unknown"))
            ) {
              existing.filename = src.filename;
            }
          } else {
            const pagesSet = new Set<number>();
            if (typeof src.page === "number") {
              pagesSet.add(src.page);
            }
            docMap.set(docIdStr, {
              document_id: src.document_id,
              filename: src.filename || "Document",
              pagesSet,
            });
          }
        }
      }
    }

    const result: UsedDocument[] = [];
    docMap.forEach((val) => {
      const pages = Array.from(val.pagesSet).sort((a, b) => a - b);
      result.push({
        document_id: val.document_id,
        filename: val.filename,
        pages,
      });
    });

    return result;
  }, [messages]);

  const usedDocIdsSet = useMemo(
    () => new Set(usedDocuments.map((d) => String(d.document_id))),
    [usedDocuments]
  );

  const unusedDocs = useMemo(
    () => documents.filter((d) => !usedDocIdsSet.has(String(d.id))),
    [documents, usedDocIdsSet]
  );

  return (
    <motion.div
      animate={{ width: collapsed ? 0 : 240 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="flex h-full flex-shrink-0 flex-col overflow-hidden"
      style={{
        borderLeft: collapsed ? "none" : "1px solid var(--border-dark)",
        background: "var(--surface)",
      }}
    >
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex h-full flex-col"
          >
            {/* Header */}
            <div
              className="flex flex-shrink-0 items-center justify-between px-4 py-4"
              style={{ borderBottom: "1px solid var(--border-dark)" }}
            >
              <h3 className="text-sm font-semibold">Sources</h3>
              <button onClick={onToggle} style={{ color: "var(--muted-light)" }}>
                <DynamicIcon name="PanelRightClose" size={17} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-3 py-3">
              {/* USED IN THIS CONVERSATION */}
              <p className="muted mb-2 px-1 text-[11px] font-semibold uppercase tracking-wide">
                USED IN THIS CONVERSATION
              </p>

              {usedDocuments.length === 0 ? (
                <p className="muted mb-4 px-1 text-xs">No sources yet</p>
              ) : (
                <div className="mb-4 flex flex-col gap-2">
                  {usedDocuments.map((doc) => (
                    <div
                      key={String(doc.document_id)}
                      className="flex flex-col gap-1.5 rounded-lg p-2.5"
                      style={{
                        background: "var(--base)",
                        border: "1px solid var(--border-dark)",
                      }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md"
                          style={{ background: "var(--accent-pale)" }}
                        >
                          <DynamicIcon
                            name="FileText"
                            size={13}
                            style={{ color: "var(--accent)" }}
                          />
                        </div>
                        <Link
                          href={`/documents/${doc.document_id}`}
                          className="truncate text-sm font-medium transition-colors hover:underline"
                          style={{ color: "var(--text-light)" }}
                          title={doc.filename}
                        >
                          {doc.filename}
                        </Link>
                      </div>

                      {doc.pages.length > 0 && (
                        <div className="ml-[34px] flex flex-wrap gap-1.5 pt-0.5">
                          {doc.pages.map((page) => (
                            <Link
                              key={page}
                              href={`/documents/${doc.document_id}?page=${page}`}
                              className="rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors hover:opacity-80"
                              style={{
                                background: "var(--accent-pale)",
                                color: "var(--accent)",
                              }}
                            >
                              p. {page}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* ALL DOCUMENTS */}
              <p className="muted mb-2 mt-4 px-1 text-[11px] font-semibold uppercase tracking-wide">
                ALL DOCUMENTS
              </p>

              {isLoading ? (
                <p className="muted p-2 text-xs">Loading...</p>
              ) : error ? (
                <div className="p-2 text-xs">
                  <p className="text-red-400 mb-1 font-medium">{error}</p>
                  <button
                    onClick={fetchDocs}
                    className="text-xs font-semibold text-[var(--accent)] hover:underline"
                  >
                    Retry
                  </button>
                </div>
              ) : unusedDocs.length === 0 ? (
                <p className="muted p-2 text-xs">No documents yet</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {unusedDocs.map((doc) => {
                    const isCompleted = doc.status === "completed";
                    const statusLabel =
                      doc.status === "failed" ? "failed" : "processing";

                    if (isCompleted) {
                      return (
                        <div
                          key={String(doc.id)}
                          className="flex items-center justify-between gap-2.5 rounded-lg p-2.5 transition-colors"
                          style={{
                            background: "var(--base)",
                            border: "1px solid var(--border-dark)",
                          }}
                        >
                          <div className="flex min-w-0 flex-1 items-center gap-2.5">
                            <div
                              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md"
                              style={{ background: "var(--accent-pale)" }}
                            >
                              <DynamicIcon
                                name="FileText"
                                size={13}
                                style={{ color: "var(--accent)" }}
                              />
                            </div>
                            <Link
                              href={`/documents/${doc.id}`}
                              className="truncate text-sm font-medium transition-colors hover:underline"
                              style={{ color: "var(--text-light)" }}
                              title={doc.filename}
                            >
                              {doc.filename}
                            </Link>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={String(doc.id)}
                        className="flex items-center justify-between gap-2.5 rounded-lg p-2.5 opacity-60"
                        style={{
                          background: "var(--base)",
                          border: "1px solid var(--border-dark)",
                        }}
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-2.5">
                          <div
                            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md"
                            style={{ background: "rgba(255,255,255,0.05)" }}
                          >
                            <DynamicIcon name="FileText" size={13} className="muted" />
                          </div>
                          <span
                            className="muted truncate text-sm font-medium"
                            title={doc.filename}
                          >
                            {doc.filename}
                          </span>
                        </div>
                        <span className="flex-shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-light)] bg-white/5 border border-white/10">
                          {statusLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}