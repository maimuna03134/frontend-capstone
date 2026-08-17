import { streamText, convertToModelMessages } from "ai";
import { CHAT_MODEL, SYSTEM_PROMPT } from "@/lib/chat-config";
import { calculateCartSummary } from "@/lib/tools";

export const maxDuration = 30;

// Maps whatever the model provider throws into one of a few safe tokens the
// client can key off of — never the raw error, which could leak internals.
function categorizeError(error) {
  const message = error instanceof Error ? error.message : String(error ?? "");
  const lower = message.toLowerCase();

  // Errors thrown deliberately inside our own tools (see lib/tools.js) are
  // already safe, user-facing copy — pass them through as-is instead of
  // masking them behind a generic category.
  if (lower.includes("in stock per order")) {
    return message;
  }

  if (lower.includes("429") || lower.includes("rate limit") || lower.includes("quota")) {
    return "rate-limit";
  }
  if (lower.includes("fetch failed") || lower.includes("network") || lower.includes("econnrefused")) {
    return "network";
  }
  return "server";
}

export async function POST(req) {
  const { messages } = await req.json();

  const result = streamText({
    model: CHAT_MODEL,
    instructions: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    tools: { calculateCartSummary },
  });

  return result.toUIMessageStreamResponse({ onError: categorizeError });
}