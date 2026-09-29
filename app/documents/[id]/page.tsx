"use client";

import { useState, useEffect, useMemo, useRef, Suspense, FormEvent } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  getDocumentChunks,
  type DocumentDetail,
  type DocumentChunk,
} from "@/lib/api";
import { DynamicIcon } from "@/lib/icon";
import { StatusBadge, type DocStatus } from "@/components/documents/StatusBadge";

function findOverlapLength(prevText: string, currText: string): number {
  if (!prevText || !currText) return 0;
  const maxLen = Math.min(prevText.length, currText.length, 600);
  for (let len = maxLen; len >= 20; len--) {
    const prevSuffix = prevText.slice(-len);
    const currPrefix = currText.slice(0, len);
    if (prevSuffix === currPrefix) {
      return len;
    }
  }
  return 0;
}

function buildPages(
  chunks: DocumentChunk[],
  totalPages: number
): Record<number, string> {
  const pagesMap: Record<number, string[]> = {};
  let prevOriginalText = "";

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const originalText = chunk.text || "";
    let trimmedText = originalText;

    if (i > 0 && prevOriginalText) {
      const overlapLen = findOverlapLength(prevOriginalText, originalText);
      if (overlapLen >= 20) {
        trimmedText = originalText.slice(overlapLen);
      }
    }

    prevOriginalText = originalText;

    if (!pagesMap[chunk.page]) {
      pagesMap[chunk.page] = [];
    }
    if (trimmedText) {
      pagesMap[chunk.page].push(trimmedText);
    }
  }

  const result: Record<number, string> = {};
  for (let p = 1; p <= totalPages; p++) {
    const pageChunks = pagesMap[p];
    if (pageChunks && pageChunks.length > 0) {
      result[p] = pageChunks.join("\n").trim();
    } else {
      result[p] = "";
    }
  }

  return result;
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

function DocumentReaderContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [docDetail, setDocDetail] = useState<DocumentDetail | null>(null);
  const [chunks, setChunks] = useState<DocumentChunk[]>([]);
  const [notFound, setNotFound] = useState(false);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [jumpInput, setJumpInput] = useState<string>("");

  const contentRef = useRef<HTMLDivElement>(null);
  const sidebarRefs = useRef<Record<number, HTMLButtonElement | null>>({});

  const fetchDocument = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    setNotFound(false);

    try {
      const res = await getDocumentChunks(id);
      setDocDetail(res.document);
      setChunks(res.chunks || []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message === "Document not found") {
          setNotFound(true);
        } else {
          setError(err.message);
        }
      } else {
        setError("Failed to fetch document");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocument();
  }, [id]);

  const totalPages = useMemo(() => {
    if (docDetail?.total_pages && docDetail.total_pages > 0) {
      return docDetail.total_pages;
    }
    if (chunks.length > 0) {
      return Math.max(...chunks.map((c) => c.page));
    }
    return 1;
  }, [docDetail, chunks]);

  const pagesMap = useMemo(() => {
    return buildPages(chunks, totalPages);
  }, [chunks, totalPages]);

  // Sync page from URL query param
  useEffect(() => {
    const urlPage = parseInt(searchParams.get("page") || "1", 10);
    if (!isNaN(urlPage) && urlPage >= 1 && urlPage <= totalPages) {
      setCurrentPage(urlPage);
    } else {
      setCurrentPage(1);
    }
  }, [searchParams, totalPages]);

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setCurrentPage(p);
    router.replace(`/documents/${id}?page=${p}`, { scroll: false });

    // Scroll content top
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }

    // Scroll sidebar item
    const sidebarEl = sidebarRefs.current[p];
    if (sidebarEl) {
      sidebarEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  };

  const handleJumpSubmit = (e: FormEvent) => {
    e.preventDefault();
    const target = parseInt(jumpInput, 10);
    if (!isNaN(target) && target >= 1 && target <= totalPages) {
      goToPage(target);
      setJumpInput("");
    }
  };

  const statusMapped: DocStatus =
    docDetail?.status === "completed"
      ? "ready"
      : docDetail?.status === "failed"
      ? "failed"
      : "processing";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <DynamicIcon name="Loader2" size={28} className="animate-spin text-[#B7D96B]" />
        <p className="muted text-sm font-medium">Loading document...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400">
          <DynamicIcon name="FileX" size={24} />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Document not found</h2>
          <p className="muted text-xs mt-1">The document you requested does not exist or was deleted.</p>
        </div>
        <button
          onClick={() => router.back()}
          className="accent-chip px-4 py-2 rounded-lg text-sm font-semibold"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400">
          <DynamicIcon name="AlertCircle" size={24} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-red-400">Error Loading Document</h2>
          <p className="muted text-xs mt-1">{error}</p>
        </div>
        <button
          onClick={fetchDocument}
          className="accent-chip px-4 py-2 rounded-lg text-sm font-semibold"
        >
          Retry
        </button>
      </div>
    );
  }

  // Processing state
  if (chunks.length === 0 && docDetail?.status !== "completed") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <div className="w-12 h-12 rounded-xl bg-[#B7D96B]/10 flex items-center justify-center text-[#B7D96B]">
          <DynamicIcon name="Clock" size={24} />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Document is processing</h2>
          <p className="muted text-xs mt-1">
            Document abhi processing me hai, thodi der baad try karo.
          </p>
        </div>
        <button
          onClick={fetchDocument}
          className="accent-chip px-4 py-2 rounded-lg text-sm font-semibold"
        >
          Check Again
        </button>
      </div>
    );
  }

  // Empty chunks state
  if (chunks.length === 0 && docDetail?.status === "completed") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/50">
          <DynamicIcon name="FileText" size={24} />
        </div>
        <div>
          <h2 className="text-lg font-semibold">No content found.</h2>
          <p className="muted text-xs mt-1">No readable text chunks exist for this document.</p>
        </div>
        <button
          onClick={() => router.back()}
          className="accent-chip px-4 py-2 rounded-lg text-sm font-semibold"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="surface max-w-7xl mx-auto my-6 rounded-2xl overflow-hidden flex flex-col min-h-[82vh]"
      style={{
        border: "1px solid rgba(183, 217, 107, 0.16)",
        boxShadow:
          "0 0 0 1px rgba(183, 217, 107, 0.03), 0 0 24px rgba(183, 217, 107, 0.06)",
      }}
    >
      {/* Top Header */}
      <div
        className="flex flex-wrap items-center justify-between gap-4 px-6 py-4"
        style={{ borderBottom: "1px solid var(--border-dark)" }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            aria-label="Back"
          >
            <DynamicIcon name="ArrowLeft" size={18} />
          </button>
          <div>
            <h1 className="text-base font-semibold text-white tracking-tight truncate max-w-md">
              {docDetail?.filename || "Document Reader"}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs muted">
              <span>{totalPages} pages</span>
              {docDetail?.file_size && (
                <>
                  <span>·</span>
                  <span>{formatFileSize(docDetail.file_size)}</span>
                </>
              )}
              <span>·</span>
              <StatusBadge status={statusMapped} />
              {docDetail?.created_at && (
                <>
                  <span>·</span>
                  <span>Uploaded {formatDate(docDetail.created_at)}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Body: Mobile Dropdown + Left Sidebar + Right Content Area */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden p-6 gap-6">
        {/* Mobile Page Dropdown */}
        <div className="md:hidden flex flex-col gap-1">
          <label className="text-xs muted">Select Page:</label>
          <select
            value={currentPage}
            onChange={(e) => goToPage(Number(e.target.value))}
            className="w-full bg-[#0D110B] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none"
          >
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <option key={p} value={p}>
                Page {p} {!pagesMap[p] ? "(No text)" : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Desktop Left Sidebar */}
        <div className="hidden md:flex flex-col w-48 shrink-0 overflow-y-auto max-h-[calc(82vh-180px)] pr-2 gap-1 border-r border-white/5">
          <p className="text-xs font-semibold muted px-3 py-1 uppercase tracking-wider">
            Pages ({totalPages})
          </p>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            const isActive = p === currentPage;
            const hasText = Boolean(pagesMap[p]);
            return (
              <button
                key={p}
                ref={(el) => {
                  sidebarRefs.current[p] = el;
                }}
                onClick={() => goToPage(p)}
                className={`text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-between ${
                  isActive
                    ? "bg-[#B7D96B]/15 text-[#B7D96B] border border-[#B7D96B]/30 font-semibold"
                    : hasText
                    ? "text-white/70 hover:text-white hover:bg-white/5"
                    : "text-white/30 hover:text-white/50 hover:bg-white/5"
                }`}
              >
                <span>Page {p}</span>
                {!hasText && <span className="text-[10px] muted">empty</span>}
              </button>
            );
          })}
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Content Subheader */}
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-sm font-medium text-white/80">
              Page {currentPage} of {totalPages}
            </h2>
          </div>

          {/* Page Text Viewer */}
          <div
            ref={contentRef}
            className="flex-1 overflow-y-auto max-h-[calc(82vh-230px)] p-6 rounded-xl bg-[#0D110B]/60 border border-white/5"
          >
            {pagesMap[currentPage] ? (
              <p className="whitespace-pre-wrap break-words text-sm text-white/90 leading-relaxed font-sans font-normal">
                {pagesMap[currentPage]}
              </p>
            ) : (
              <div className="py-16 text-center text-sm muted italic">
                Is page par text nahi mila
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation Control Bar */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 bg-black/20"
        style={{ borderTop: "1px solid var(--border-dark)" }}
      >
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1}
          className="accent-chip px-3.5 py-1.5 rounded-lg text-xs font-medium disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5"
        >
          <DynamicIcon name="ChevronLeft" size={14} />
          Prev
        </button>

        <form onSubmit={handleJumpSubmit} className="flex items-center gap-2">
          <span className="text-xs muted">Go to page:</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={jumpInput}
            onChange={(e) => setJumpInput(e.target.value)}
            placeholder={`${currentPage}`}
            className="w-16 bg-[#0D110B] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-center text-white outline-none focus:border-[#B7D96B]/50"
          />
          <button
            type="submit"
            className="px-2.5 py-1 rounded-lg text-xs bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 transition-colors"
          >
            Go
          </button>
        </form>

        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="accent-chip px-3.5 py-1.5 rounded-lg text-xs font-medium disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5"
        >
          Next
          <DynamicIcon name="ChevronRight" size={14} />
        </button>
      </div>
    </motion.div>
  );
}

export default function DocumentReaderPage() {
  return (
    <div className="min-h-screen w-full bg-[#090C08] text-[#E0E6DC] p-4 md:p-8">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
            <DynamicIcon name="Loader2" size={28} className="animate-spin text-[#B7D96B]" />
            <p className="muted text-sm font-medium">Loading reader...</p>
          </div>
        }
      >
        <DocumentReaderContent />
      </Suspense>
    </div>
  );
}
