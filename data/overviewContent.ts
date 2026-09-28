// data/overviewContent.ts
//
// Single source of truth for the Overview (dashboard) page — dummy/static
// data for now, shaped exactly like what the real API will eventually
// return, so swapping in live data later is a fetch call, not a rewrite.

export interface StatCard {
  id: string;
  label: string;
  value: string;
  icon: string; // lucide-react icon name
  trend?: string; // small secondary line, e.g. "+2 this week"
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  href: string;
}

export interface ActivityItem {
  id: string;
  type: "chat" | "upload";
  title: string;
  subtitle?: string; // e.g. document status/page count for uploads
  timestamp: string; // human-readable, e.g. "2 hours ago"
  href: string;
}

export interface SystemStatusItem {
  id: string;
  label: string;
  status: "operational" | "degraded" | "down";
}

export const overviewHeader = {
  greeting: "Welcome back",
  userName: "Alex Kumar",
  subtitle: "Here's what's happening across your knowledge base today.",
};

export const statCards: StatCard[] = [
  {
    id: "total-documents",
    label: "Total Documents",
    value: "12",
    icon: "FileText",
    trend: "+2 this week",
  },
  {
    id: "ready-documents",
    label: "Ready to Search",
    value: "9 / 12",
    icon: "CheckCircle2",
    trend: "3 processing",
  },
  {
    id: "total-conversations",
    label: "Conversations",
    value: "47",
    icon: "MessageSquare",
    trend: "+8 this week",
  },
  {
    id: "avg-response",
    label: "Avg. Response Time",
    value: "1.2s",
    icon: "Zap",
    trend: "-0.3s vs last week",
  },
];

export const quickActions: QuickAction[] = [
  { id: "new-search", label: "New Search", icon: "Search", href: "/search" },
  { id: "upload-document", label: "Upload Document", icon: "Upload", href: "/documents" },
];

// Mixed timeline — chats and uploads interleaved by recency, matches the
// "recent activity feed" section from the Overview layout.
export const recentActivity: ActivityItem[] = [
  {
    id: "act-1",
    type: "chat",
    title: 'Asked "What\'s the maternity leave policy?"',
    timestamp: "2 hours ago",
    href: "/search?session=sess_1",
  },
  {
    id: "act-2",
    type: "upload",
    title: "Uploaded handbook_2026.pdf",
    subtitle: "12 pages · Ready",
    timestamp: "5 hours ago",
    href: "/documents/doc_1",
  },
  {
    id: "act-3",
    type: "chat",
    title: 'Asked "How do I file an expense reimbursement?"',
    timestamp: "1 day ago",
    href: "/search?session=sess_2",
  },
  {
    id: "act-4",
    type: "chat",
    title: 'Asked "What\'s the notice period for resignation?"',
    timestamp: "1 day ago",
    href: "/search?session=sess_3",
  },
  {
    id: "act-5",
    type: "upload",
    title: "Uploaded legal_contract_v3.pdf",
    subtitle: "8 pages · Processing",
    timestamp: "2 days ago",
    href: "/documents/doc_2",
  },
  {
    id: "act-6",
    type: "upload",
    title: "Uploaded old_scanned_form.pdf",
    subtitle: "5 pages · Needs OCR",
    timestamp: "3 days ago",
    href: "/documents/doc_3",
  },
  {
    id: "act-7",
    type: "chat",
    title: 'Asked "Summarize the vendor NDA terms"',
    timestamp: "4 days ago",
    href: "/search?session=sess_4",
  },
];

export const systemStatus: SystemStatusItem[] = [
  { id: "postgres", label: "Database", status: "operational" },
  { id: "qdrant", label: "Vector Search", status: "operational" },
  { id: "celery", label: "Ingestion Queue", status: "operational" },
];