import type { Citation } from "@/types/chat";

const MOCK_ANSWER =
  "Employees get 26 weeks of paid maternity leave [1], available to full-time staff after six months of continuous employment [2].";

const MOCK_CITATIONS: Citation[] = [
  { id: 1, docName: "policy.pdf", page: 3, excerpt: "Employees are entitled to 26 weeks of paid maternity leave under the current policy." },
  { id: 2, docName: "handbook_2026.pdf", page: 4, excerpt: "This leave applies to all full-time staff who have completed at least six months of continuous employment." },
];

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Yields text chunks one at a time. Long answers reveal 2–3 words per
 * tick (feels faster to read); short answers reveal word-by-word.
 */
export async function* streamAssistantReply(prompt: string) {
  const words = MOCK_ANSWER.split(" ");
  const isLong = words.length > 25;

  let i = 0;
  while (i < words.length) {
    const chunkSize = isLong ? (Math.random() < 0.5 ? 2 : 3) : 1;
    const chunk = words.slice(i, i + chunkSize).join(" ");
    i += chunkSize;
    await delay(isLong ? 55 : 90);
    yield i >= words.length ? chunk : chunk + " ";
  }
}

export async function getCitationsForLastAnswer(): Promise<Citation[]> {
  return MOCK_CITATIONS;
}

/** Derives a short session title from the first user message. */
export function deriveSessionTitle(firstMessage: string): string {
  const trimmed = firstMessage.trim();
  return trimmed.length > 40 ? trimmed.slice(0, 40) + "…" : trimmed || "New chat";
}