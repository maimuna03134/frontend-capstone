import { streamText, convertToModelMessages } from "ai";
import { CHAT_MODEL, SYSTEM_PROMPT } from "@/lib/chat-config";
import { calculateCartSummary } from "@/lib/tools";

export const maxDuration = 30;

export async function POST(req) {
  const { messages } = await req.json();

  const result = streamText({
    model: CHAT_MODEL,
    instructions: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    tools: { calculateCartSummary },
  });

  return result.toUIMessageStreamResponse();
}