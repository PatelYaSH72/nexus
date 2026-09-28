export interface Citation {
  id: number;
  docName: string;
  page: number;
  excerpt: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  citations?: Citation[];
  status: "thinking" | "streaming" | "complete";
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

