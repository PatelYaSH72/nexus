export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface SignupPayload {
  name?: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  token?: string;
  access_token?: string;
  jwt?: string;
  data?: {
    token?: string;
    access_token?: string;
    user?: unknown;
  };
  message?: string;
  user?: unknown;
  [key: string]: unknown;
}

/** Cookie Helper utilities */
export function setTokenCookie(token: string) {
  if (typeof document === "undefined") return;
  // Cookie valid for 7 days
  document.cookie = `token=${encodeURIComponent(
    token
  )}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
}

export function getTokenCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function removeTokenCookie() {
  if (typeof document === "undefined") return;
  document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
}

export function handle401() {
  removeTokenCookie();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

/** Extract JWT token from backend response body regardless of key structure */
export function extractTokenFromResponse(data: unknown): string | null {
  if (!data) return null;
  if (typeof data === "string") return data;
  if (typeof data === "object" && data !== null) {
    const obj = data as Record<string, unknown>;
    if (typeof obj.token === "string") return obj.token;
    if (typeof obj.access_token === "string") return obj.access_token;
    if (typeof obj.jwt === "string") return obj.jwt;
    if (obj.data) {
      return extractTokenFromResponse(obj.data);
    }
  }
  return null;
}

/** Helper to parse FastAPI detail string or array of errors */
function parseFastApiError(data: unknown, fallback: string): string {
  if (!data || typeof data !== "object") return fallback;
  const obj = data as Record<string, unknown>;
  const detail = obj.detail || obj.message || obj.error;

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    const msgs = detail
      .map((item) => (item && typeof item === "object" && "msg" in item ? String(item.msg) : ""))
      .filter(Boolean);
    if (msgs.length > 0) {
      return msgs.join(", ");
    }
  }

  return fallback;
}

/** Signup API call */
export async function signupApi(payload: SignupPayload): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = parseFastApiError(data, `Signup failed with status ${res.status}`);
    throw new Error(errorMsg);
  }

  const token = extractTokenFromResponse(data);
  if (token) {
    setTokenCookie(token);
  }

  return data;
}

/** Login API call */
export async function loginApi(payload: LoginPayload): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = parseFastApiError(data, `Login failed with status ${res.status}`);
    throw new Error(errorMsg);
  }

  const token = extractTokenFromResponse(data);
  if (token) {
    setTokenCookie(token);
  }

  return data;
}

export function logoutUser() {
  handle401();
}

export interface UserProfile {
  id: number;
  email: string;
  name?: string | null;
}

export async function getUserMe(): Promise<UserProfile> {
  const token = getTokenCookie();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
    method: "GET",
    headers,
  });

  if (res.status === 401) {
    handle401();
    throw new Error("Unauthorized");
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(parseFastApiError(data, `Failed to load user profile (${res.status})`));
  }

  return data as UserProfile;
}

export interface ApiDocument {
  id: number | string;
  filename: string;
  file_hash?: string;
  file_size?: number;
  total_pages?: number;
  total_parent_chunks?: number;
  total_child_chunks?: number;
  status: string;
  error_message?: string | null;
  created_at?: string;
  updated_at?: string;
}

/** Get Documents List API call */
export async function getDocuments(): Promise<ApiDocument[]> {
  const token = getTokenCookie();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/api/v1/documents`, {
    method: "GET",
    headers,
  });

  if (res.status === 401) {
    handle401();
    throw new Error("Unauthorized");
  }

  const data = await res.json().catch(() => []);

  if (!res.ok) {
    const errorMsg = parseFastApiError(data, `Failed to fetch documents (${res.status})`);
    throw new Error(errorMsg);
  }

  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.documents)) return obj.documents as ApiDocument[];
    if (Array.isArray(obj.data)) return obj.data as ApiDocument[];
    if (Array.isArray(obj.items)) return obj.items as ApiDocument[];
    if (Array.isArray(obj.results)) return obj.results as ApiDocument[];
  }

  return [];
}

/** Delete Document API call */
export async function deleteDocument(id: string | number): Promise<void> {
  const token = getTokenCookie();
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/api/v1/documents/${id}`, {
    method: "DELETE",
    headers,
  });

  if (res.status === 401) {
    handle401();
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const errorMsg = parseFastApiError(data, `Delete failed (${res.status})`);
    throw new Error(errorMsg);
  }
}

export interface UploadDocumentResponse {
  id?: string;
  name?: string;
  filename?: string;
  pages?: number;
  total_pages?: number;
  status?: string;
  message?: string;
  detail?: string;
  [key: string]: unknown;
}

/** Upload PDF Document API call */
export async function uploadDocument(
  file: File
): Promise<UploadDocumentResponse> {
  const token = getTokenCookie();
  const formData = new FormData();
  formData.append("file", file);

  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/api/v1/documents/upload`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = parseFastApiError(data, "Upload failed");
    throw new Error(errorMsg);
  }

  return data;
}

export interface DocumentChunk {
  parent_id: string;
  page: number;
  text: string;
}

export interface DocumentDetail {
  id: number | string;
  filename: string;
  file_size?: number;
  total_pages?: number;
  total_parent_chunks?: number;
  status: string;
  error_message?: string | null;
  created_at?: string;
}

export interface DocumentChunksResponse {
  document: DocumentDetail;
  chunks: DocumentChunk[];
}

/** Get Document Chunks API call */
export async function getDocumentChunks(
  id: string | number
): Promise<DocumentChunksResponse> {
  const token = getTokenCookie();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/api/v1/documents/${id}/chunks`, {
    method: "GET",
    headers,
  });

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (res.status === 404) {
    throw new Error("Document not found");
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = parseFastApiError(data, `Failed to fetch document chunks (${res.status})`);
    throw new Error(errorMsg);
  }

  return data as DocumentChunksResponse;
}

export interface SettingsData {
  system_prompt: string;
  semantic_search_enabled: boolean;
  keyword_search_enabled: boolean;
  embedding_model: string;
  reranker_model: string;
  llm_provider: string;
  llm_model: string;
  updated_at?: string;
}

export interface UpdateSettingsPayload {
  system_prompt: string;
  semantic_search_enabled: boolean;
  keyword_search_enabled: boolean;
  reranker_model: string;
  llm_model: string;
}

/** Get Settings API call */
export async function getSettings(): Promise<SettingsData> {
  const token = getTokenCookie();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/api/v1/settings`, {
    method: "GET",
    headers,
  });

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(parseFastApiError(data, `Failed to load settings (${res.status})`));
  }

  return data as SettingsData;
}

/** Update Settings API call */
export async function updateSettings(
  payload: UpdateSettingsPayload
): Promise<SettingsData> {
  const token = getTokenCookie();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/api/v1/settings`, {
    method: "PUT",
    headers,
    body: JSON.stringify(payload),
  });

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(parseFastApiError(data, `Failed to update settings (${res.status})`));
  }

  return data as SettingsData;
}

/** Reset Settings API call */
export async function resetSettings(): Promise<SettingsData> {
  const token = getTokenCookie();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/api/v1/settings/reset`, {
    method: "POST",
    headers,
  });

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(parseFastApiError(data, `Failed to reset settings (${res.status})`));
  }

  return data as SettingsData;
}

/**
 * Generic fetch wrapper for protected API calls that attaches
 * Authorization: Bearer <token> automatically if token exists.
 */
export async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getTokenCookie();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  return fetch(url, {
    ...options,
    headers,
  });
}

export interface ApiSource {
  document_id: number;
  filename: string;
  page: number;
  parent_id: string;
  // multimodal fields
  element_type?: "text" | "table" | "image";
  table_html?: string | null;
  image_b64?: string | null;
  summary?: string;
}

export interface ApiMessage {
  id: number | string;
  role: "user" | "assistant";
  content: string;
  sources?: ApiSource[] | null;
  created_at?: string;
}

export interface Conversation {
  id: string;
  title: string;
  created_at?: string;
  updated_at?: string;
  messages?: ApiMessage[];
}

export interface ChatResponse {
  user_message: ApiMessage;
  assistant_message: ApiMessage;
  conversation: Conversation;
}

/** Get Conversations List API call */
export async function getConversations(): Promise<Conversation[]> {
  const token = getTokenCookie();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/api/v1/conversations`, {
    method: "GET",
    headers,
  });

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  const data = await res.json().catch(() => []);

  if (!res.ok) {
    const errorMsg = parseFastApiError(data, `Failed to fetch conversations (${res.status})`);
    throw new Error(errorMsg);
  }

  return Array.isArray(data) ? data : [];
}

/** Get Single Conversation Detail API call */
export async function getConversation(id: string): Promise<Conversation> {
  const token = getTokenCookie();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/api/v1/conversations/${id}`, {
    method: "GET",
    headers,
  });

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = parseFastApiError(data, `Failed to fetch conversation (${res.status})`);
    throw new Error(errorMsg);
  }

  return data as Conversation;
}

/** Create Conversation API call */
export async function createConversation(): Promise<Conversation> {
  const token = getTokenCookie();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/api/v1/conversations`, {
    method: "POST",
    headers,
    body: JSON.stringify({}),
  });

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = parseFastApiError(data, `Failed to create conversation (${res.status})`);
    throw new Error(errorMsg);
  }

  return data as Conversation;
}

/** Send Message to Conversation API call */
export async function sendMessage(
  conversationId: string,
  content: string,
  documentId?: string | null
): Promise<ChatResponse> {
  const token = getTokenCookie();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(
    `${API_BASE_URL}/api/v1/conversations/${conversationId}/messages`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ content, document_id: documentId }),
    }
  );

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = parseFastApiError(data, "Something went wrong");
    throw new Error(errorMsg);
  }

  return data as ChatResponse;
}

export interface WorkspaceActivityItem {
  id: string;
  type: "upload" | "query";
  title: string;
  subtitle?: string;
  timestamp: string;
  status?: string;
}

export interface SystemStatusItem {
  id: string;
  name: string;
  status: "online" | "degraded" | "offline";
  latency: string;
}

export interface WorkspaceStatsData {
  total_documents: number;
  ready_documents: number;
  processing_documents: number;
  failed_documents: number;
  total_conversations: number;
  total_messages: number;
  avg_response_time: string;
  recent_activity: WorkspaceActivityItem[];
  system_status: SystemStatusItem[];
}

/** Fetch Real-Time Workspace Stats API call */
export async function getWorkspaceStats(): Promise<WorkspaceStatsData> {
  const token = getTokenCookie();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/api/v1/workspace/stats`, {
    method: "GET",
    headers,
  });

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(parseFastApiError(data, `Failed to load workspace stats (${res.status})`));
  }

  return data as WorkspaceStatsData;
}

