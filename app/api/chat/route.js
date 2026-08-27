import { streamText, convertToModelMessages } from "ai";
import { CHAT_MODEL, SYSTEM_PROMPT } from "@/lib/chat-config";
import { calculateCartSummary } from "@/lib/tools";
import { getClientIp, isRateLimited } from "@/lib/rate-limit";

export const maxDuration = 30;

// Input caps: cheap to check, and they cap worst-case token spend even
// from a single request that gets past the rate limiter.
const MAX_MESSAGES = 30;
const MAX_MESSAGE_CHARS = 4000;

// Maps whatever the model provider throws into one of a few safe tokens the
// client can key off of — never the raw error, which could leak internals.
function categorizeError(error) {
  const message = error instanceof Error ? error.message : String(error ?? "");
  const lower = message.toLowerCase();

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

function getMessageText(message) {
  return (message.parts ?? [])
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

function validateMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    return "No messages provided.";
  }
  if (messages.length > MAX_MESSAGES) {
    return "This conversation has gotten long — start a new chat to continue.";
  }
  for (const message of messages) {
    if (getMessageText(message).length > MAX_MESSAGE_CHARS) {
      return "That message is too long — try breaking it up.";
    }
  }
  return null;
}

export async function POST(req) {
  // Rate limit first — a blocked request never reaches req.json() or the
  // model, so it costs nothing beyond a Map lookup.
  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    return new Response("rate-limit", { status: 429 });
  }

  const { messages } = await req.json();

  const validationError = validateMessages(messages);
  if (validationError) {
    return new Response("invalid-request", { status: 400 });
  }

  const result = streamText({
    model: CHAT_MODEL,
    instructions: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    tools: { calculateCartSummary },
  });

  return result.toUIMessageStreamResponse({ onError: categorizeError });
}