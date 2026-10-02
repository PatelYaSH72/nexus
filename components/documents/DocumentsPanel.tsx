"use client";

import { useState, useEffect, useRef, ChangeEvent, DragEvent } from "react";
import { motion } from "framer-motion";
import { DynamicIcon } from "@/lib/icon";
import { DocumentRow, type DocumentItem } from "./DocumentRow";
import {
  getDocuments,
  uploadDocument,
  deleteDocument,
  type ApiDocument,
} from "@/lib/api";
import { getSocket, type DocumentStatusPayload } from "@/lib/socket";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

const mapBackendDocToItem = (item: ApiDocument): DocumentItem => {
  const statusStr = String(item.status || "").toLowerCase();
  let statusMapped: DocumentItem["status"] = "processing";
  if (
    statusStr === "completed" ||
    statusStr === "ready" ||
    statusStr === "success" ||
    statusStr === "done"
  ) {
    statusMapped = "ready";
  } else if (statusStr === "failed" || statusStr === "error") {
    statusMapped = "failed";
  }

  let formattedDate = "Sep 29";
  const rawObj = item as unknown as Record<string, unknown>;
  const rawDate =
    item.created_at ||
    rawObj.updated_at ||
    rawObj.created_date ||
    rawObj.timestamp;

  if (rawDate && typeof rawDate === "string") {
    try {
      const parsed = new Date(rawDate);
      if (!isNaN(parsed.getTime())) {
        formattedDate = parsed.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      }
    } catch {
      // fallback
    }
  }

  const docId =
    item.id ??
    rawObj._id ??
    rawObj.document_id ??
    "";
  const filename =
    item.filename ||
    rawObj.name ||
    rawObj.original_filename ||
    rawObj.title ||
    "document.pdf";
  const pageCount =
    typeof item.total_pages === "number"
      ? item.total_pages
      : typeof rawObj.pages === "number"
      ? (rawObj.pages as number)
      : typeof rawObj.page_count === "number"
      ? (rawObj.page_count as number)
      : 0;

  return {
    id: String(docId),
    name: String(filename),
    status: statusMapped,
    pages: pageCount,
    uploaded: formattedDate,
  };
};

export function DocumentsPanel({ className = "" }: { className?: string }) {
  const [docList, setDocList] = useState<DocumentItem[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocs = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setFetchLoading(true);
    }
    setFetchError(null);
    try {
      const apiDocs = await getDocuments();
      setDocList(apiDocs.map(mapBackendDocToItem));
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFetchError(err.message);
      } else {
        setFetchError("Failed to load documents.");
      }
    } finally {
      setFetchLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDocs();

    const socket = getSocket();
    if (!socket.connected) {
      socket.connect();
    }

    const handleDocStatus = (payload: DocumentStatusPayload) => {
      setDocList((prev) => {
        const docIdStr = String(payload.id || payload.document_id);
        const exists = prev.some((d) => d.id === docIdStr);

        let statusMapped: DocumentItem["status"] = "processing";
        const statusStr = String(payload.status || "").toLowerCase();
        if (statusStr === "completed" || statusStr === "ready" || statusStr === "success") {
          statusMapped = "ready";
        } else if (statusStr === "failed" || statusStr === "error") {
          statusMapped = "failed";
        }

        if (exists) {
          return prev.map((item) => {
            if (item.id === docIdStr) {
              return {
                ...item,
                status: statusMapped,
                step: payload.step,
                pages: payload.pages && payload.pages > 0 ? payload.pages : item.pages,
              };
            }
            return item;
          });
        } else {
          fetchDocs(true);
          return prev;
        }
      });
    };

    socket.on("document:status", handleDocStatus);

    return () => {
      socket.off("document:status", handleDocStatus);
    };
  }, []);

  const filtered = docList.filter((d) =>
    d.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Delete this document?");
    if (!confirmed) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    setDeletingId(id);

    try {
      await deleteDocument(id);
      setSuccessMsg("Document deleted successfully!");
      await fetchDocs(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Delete failed.");
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleFileUpload = async (file: File) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    // Client-side validation
    const isPdf =
      file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setErrorMsg("Only PDF files are allowed.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrorMsg("File size must be less than 25MB.");
      return;
    }

    setUploading(true);

    try {
      await uploadDocument(file);
      setSuccessMsg("Document uploaded successfully!");
      // Sync list with backend after upload
      await fetchDocs(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Upload failed. Please try again.");
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileUpload(selectedFile);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileUpload(droppedFile);
    }
  };

  return (
    <motion.div
      variants={itemVariants}
      className={`surface flex flex-col overflow-hidden rounded-2xl ${className}`}
      style={{
        border: "1px solid rgba(183, 217, 107, 0.16)",
        boxShadow:
          "0 0 0 1px rgba(183, 217, 107, 0.03), 0 0 24px rgba(183, 217, 107, 0.06)",
      }}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Panel header */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 px-6 py-5"
        style={{ borderBottom: "1px solid var(--border-dark)" }}
      >
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-base font-semibold">Documents</h2>
            <p className="muted mt-1 text-xs">
              {docList.length} total ·{" "}
              {docList.filter((d) => d.status === "ready").length} ready
            </p>
          </div>
          {refreshing && (
            <div className="flex items-center gap-1.5 text-xs text-white/50 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
              <DynamicIcon name="Loader2" size={12} className="animate-spin" />
              <span>Refreshing...</span>
            </div>
          )}
        </div>
        <div className="relative">
          <DynamicIcon
            name="Search"
            size={14}
            className="muted pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search filename..."
            className="rounded-lg py-2 pl-8 pr-3 text-sm outline-none"
            style={{
              background: "var(--base)",
              border: "1px solid var(--border-dark)",
              width: 200,
              color: "var(--text-light)",
            }}
          />
        </div>
      </div>

      {/* Body: left list / right upload */}
      <div className="grid flex-1 grid-cols-1 lg:grid-cols-[1fr_380px]">
        {/* Left: document list */}
        <div className="flex flex-col overflow-y-auto px-6 py-4">
          <div
            className="muted grid grid-cols-[1fr_160px_70px_110px_130px] gap-4 border-b px-3 pb-3 text-xs"
            style={{ borderColor: "var(--border-dark)" }}
          >
            <span>Name</span>
            <span>Status</span>
            <span>Pages</span>
            <span>Uploaded</span>
            <span>Actions</span>
          </div>

          {fetchLoading ? (
            <p className="muted px-3 py-8 text-center text-sm">
              Loading documents...
            </p>
          ) : fetchError ? (
            <p className="px-3 py-8 text-center text-sm text-red-400">
              {fetchError}
            </p>
          ) : docList.length === 0 ? (
            <p className="muted px-3 py-8 text-center text-sm">
              No documents yet.
            </p>
          ) : filtered.length === 0 ? (
            <p className="muted px-3 py-8 text-center text-sm">
              No documents match “{query}”.
            </p>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="mt-1"
            >
              {filtered.map((doc) => (
                <DocumentRow
                  key={doc.id}
                  doc={doc}
                  isDeleting={deletingId === doc.id}
                  onView={(id) => (window.location.href = `/documents/${id}`)}
                  onDelete={handleDelete}
                />
              ))}
            </motion.div>
          )}
        </div>

        {/* Right: upload panel with drag & drop */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center gap-3 px-6 py-8 text-center transition-all ${
            isDragging ? "bg-white/10 border-accent" : ""
          }`}
          style={{
            borderLeft: "1px solid var(--border-dark)",
            background: isDragging
              ? "rgba(183, 217, 107, 0.08)"
              : "rgba(255,255,255,0.015)",
          }}
        >
          <div
            className="flex h-14 w-14 items-center justify-center rounded-xl transition-transform"
            style={{ background: "var(--accent-pale)" }}
          >
            <DynamicIcon
              name="Upload"
              size={22}
              style={{ color: "var(--accent)" }}
            />
          </div>
          <div>
            <p className="text-sm font-medium">Add a document</p>
            <p className="muted mt-1 text-xs">
              Drag & drop or click to browse
            </p>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="accent-chip mt-2 w-full rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60 cursor-pointer"
          >
            {uploading ? "Uploading..." : "Upload Document"}
          </button>

          {errorMsg && (
            <p className="text-xs font-medium text-red-400 mt-1">{errorMsg}</p>
          )}

          {successMsg && (
            <p className="text-xs font-medium text-emerald-400 mt-1">
              {successMsg}
            </p>
          )}

          <p className="muted text-[11px]">PDF up to 25MB</p>
        </div>
      </div>
    </motion.div>
  );
}