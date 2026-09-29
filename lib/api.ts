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
    const errorMsg =
      (data as { message?: string; detail?: string; error?: string }).message ||
      (data as { message?: string; detail?: string; error?: string }).detail ||
      (data as { message?: string; detail?: string; error?: string }).error ||
      `Signup failed with status ${res.status}`;
    throw new Error(errorMsg);
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
    const errorMsg =
      (data as { message?: string; detail?: string; error?: string }).message ||
      (data as { message?: string; detail?: string; error?: string }).detail ||
      (data as { message?: string; detail?: string; error?: string }).error ||
      `Login failed with status ${res.status}`;
    throw new Error(errorMsg);
  }

  const token = extractTokenFromResponse(data);
  if (token) {
    setTokenCookie(token);
  }

  return data;
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
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  const data = await res.json().catch(() => []);

  if (!res.ok) {
    const errorMsg =
      (data as { detail?: string; message?: string; error?: string }).detail ||
      (data as { detail?: string; message?: string; error?: string }).message ||
      (data as { detail?: string; message?: string; error?: string }).error ||
      `Failed to fetch documents (${res.status})`;
    throw new Error(errorMsg);
  }

  return Array.isArray(data) ? data : [];
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
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const errorMsg =
      (data as { detail?: string; message?: string; error?: string }).detail ||
      (data as { detail?: string; message?: string; error?: string }).error ||
      `Delete failed (${res.status})`;
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
    const errorMsg =
      (data as { detail?: string; message?: string; error?: string }).detail ||
      (data as { detail?: string; message?: string; error?: string }).message ||
      (data as { detail?: string; message?: string; error?: string }).error ||
      "Upload failed";
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
    const errorMsg =
      (data as { detail?: string; message?: string; error?: string }).detail ||
      (data as { detail?: string; message?: string; error?: string }).message ||
      (data as { detail?: string; message?: string; error?: string }).error ||
      `Failed to fetch document chunks (${res.status})`;
    throw new Error(errorMsg);
  }

  return data as DocumentChunksResponse;
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
