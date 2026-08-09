import { streamText, convertToModelMessages } from "ai";
import { CHAT_MODEL, SYSTEM_PROMPT } from "@/lib/chat-config";

// Next.js requires route segment config to be a static literal it can parse
// at build time — it can't be an imported reference. Keep this number in
// sync with MAX_DURATION_SECONDS in lib/chat-config.js by hand; it's the
// one exception to "all config lives in that file."
export const maxDuration = 30; // = MAX_DURATION_SECONDS

export async function POST(req) {
  const { messages } = await req.json();

  const result = streamText({
    model: CHAT_MODEL,
    instructions: SYSTEM_PROMPT,
    // useChat sends its whole UIMessage history on every request (that's
    // what makes multi-turn conversation work) — convert it to the plain
    // model-message shape streamText expects.
    messages: convertToModelMessages(messages),
  });

  // AI_GATEWAY_API_KEY is read by the SDK straight from process.env — it's
  // never sent to, or readable by, the client. That's the whole reason this
  // call happens in a route handler instead of the Chat component.
  return result.toUIMessageStreamResponse();
}
