"use client";

import { DocumentsPanel } from "@/components/documents/DocumentsPanel";

export default function WorkspaceDocumentsPage() {
  return (
    <div className="section-dark flex flex-1 flex-col min-h-screen w-full p-6 md:p-8">
      <DocumentsPanel className="min-h-[80vh] flex-1" />
    </div>
  );
}
