"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

/** Joins a message's text parts into one string. Assistant messages arrive
 *  as a `parts` array (text, plus other part types this app doesn't use
 *  yet) rather than a flat string — this is what "typed message parts"
 *  means in the brief. */
function getMessageText(message) {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

const reducedMotionQuery =
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : null;

function subscribeToReducedMotion(callback) {
  reducedMotionQuery?.addEventListener("change", callback);
  return () => reducedMotionQuery?.removeEventListener("change", callback);
}

/** True while the OS-level "reduce motion" preference is on. The CSS in
 *  globals.css already zeroes out animation/transition *durations*
 *  automatically for every element — this hook exists only for the one bit
 *  of motion logic that lives outside CSS: how long the thinking indicator
 *  stays mounted so its exit animation can finish. Without checking this,
 *  a reduced-motion user would still wait out the full unmount delay for
 *  an animation that isn't actually playing. useSyncExternalStore (rather
 *  than useEffect + setState) is the React-recommended way to subscribe to
 *  an external browser API like matchMedia. */
function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    () => reducedMotionQuery?.matches ?? false,
    () => false, // server snapshot — no window during SSR
  );
}

/** Mirrors `value`, except when it flips to false it keeps returning true
 *  for `delayMs` longer — just enough time for an exit animation keyed off
 *  the same flip to finish before the element actually unmounts. */
function useDelayedFalse(value, delayMs) {
  const [delayed, setDelayed] = useState(value);
  const [prevValue, setPrevValue] = useState(value);

  // Adjust state during render when the input flips true — the
  // React-documented alternative to an effect for syncing derived state
  // from a prop (react.dev/learn/you-might-not-need-an-effect). Only the
  // delayed-*false* transition genuinely needs a timer, so that's the only
  // part below that needs an effect.
  if (value !== prevValue) {
    setPrevValue(value);
    if (value) setDelayed(true);
  }

  useEffect(() => {
    if (value) return;
    const timeout = setTimeout(() => setDelayed(false), delayMs);
    return () => clearTimeout(timeout);
  }, [value, delayMs]);

  return delayed;
}

export default function Chat() {
  const { messages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });
  const [input, setInput] = useState("");

  const scrollRef = useRef(null);
  const bottomRef = useRef(null);
  const isPinnedRef = useRef(true);
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);

  const isBusy = status === "submitted" || status === "streaming";

  // The assistant's message exists in `messages` as soon as the stream
  // opens, but its text stays empty for a beat before the first token
  // lands. Treat "streaming but still empty" the same as "submitted" so
  // the thinking indicator and the first token are one continuous handoff
  // instead of the indicator disappearing a frame before text appears.
  const lastMessage = messages[messages.length - 1];
  const waitingOnAssistant =
    status === "submitted" ||
    (status === "streaming" &&
      lastMessage?.role === "assistant" &&
      getMessageText(lastMessage).length === 0);

  // Keep the indicator mounted 150ms past the moment it should logically
  // disappear so its exit animation (see chat-indicator-out in globals.css)
  // has time to play instead of the element just vanishing. Skip the delay
  // entirely for reduced-motion users — there's no animation to wait for.
  const prefersReducedMotion = usePrefersReducedMotion();
  const showIndicator = useDelayedFalse(
    waitingOnAssistant,
    prefersReducedMotion ? 0 : 150,
  );

  // --- Auto-scroll: stay pinned to the bottom only while the reader is
  // already there. The moment they scroll up mid-stream, release the pin
  // and surface a "jump to latest" button instead of yanking them back down.
  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const atBottom = distanceFromBottom < 48;
    isPinnedRef.current = atBottom;
    setShowJumpToLatest(!atBottom);
  }

  useEffect(() => {
    if (isPinnedRef.current) {
      bottomRef.current?.scrollIntoView({ block: "end" });
    }
  }, [messages]);

  function jumpToLatest() {
    isPinnedRef.current = true;
    setShowJumpToLatest(false);
    bottomRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }

  function handleSubmit(event) {
    event.preventDefault();
    const text = input.trim();
    if (!text || isBusy) return;
    isPinnedRef.current = true; // sending should always snap back to bottom
    sendMessage({ text });
    setInput("");
  }

  return (
    <div className="flex h-[70vh] flex-col overflow-hidden rounded-xl border border-paper-line bg-white">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 space-y-4 overflow-y-auto px-4 py-6"
      >
        {messages.length === 0 && (
          <p className="text-sm text-ink/50">
            Ask about sizing, materials, or which category to look in — e.g.
            &ldquo;I need something warm for winter under $50.&rdquo;
          </p>
        )}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {showIndicator && <ThinkingIndicator exiting={!waitingOnAssistant} />}

        <div ref={bottomRef} />
      </div>

      {showJumpToLatest && (
        <div className="flex animate-chat-message-in justify-center border-t border-paper-line bg-white py-2">
          <button
            type="button"
            onClick={jumpToLatest}
            className="rounded-full bg-ink px-3 py-1 text-xs font-medium text-white shadow-sm"
          >
            Jump to latest ↓
          </button>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-2 border-t border-paper-line p-3"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <textarea
          rows={1}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              handleSubmit(event);
            }
          }}
          placeholder="Ask the assistant..."
          className="min-h-11 flex-1 resize-none rounded-lg border border-paper-line px-3 py-2.5 text-sm outline-none focus-visible:border-teal"
        />
        {isBusy ? (
          <button
            type="button"
            onClick={stop}
            className="h-11 shrink-0 overflow-hidden rounded-lg bg-ink px-4 text-sm font-medium text-white transition-colors duration-200"
          >
            <span key="stop" className="inline-block animate-chat-label-in">
              Stop
            </span>
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className="h-11 shrink-0 overflow-hidden rounded-lg bg-teal px-4 text-sm font-medium text-white transition-colors duration-200 disabled:opacity-40"
          >
            <span key="send" className="inline-block animate-chat-label-in">
              Send
            </span>
          </button>
        )}
      </form>
    </div>
  );
}

function MessageBubble({ message }) {
  const isUser = message.role === "user";
  const text = getMessageText(message);

  // Nothing to show yet (assistant message exists but hasn't streamed any
  // text) — the ThinkingIndicator above the message list covers this gap,
  // so render nothing here rather than an empty bubble.
  if (!text) return null;

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      {/* Plain text, not markdown: rendering half-finished markdown mid-stream
          (an unclosed code fence, a dangling **) visibly breaks the layout
          while tokens are still arriving. whitespace-pre-wrap keeps real
          line breaks without touching a parser. */}
      <div
        className={`max-w-[85%] animate-chat-message-in rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ${
          isUser
            ? "bg-teal text-white"
            : "border border-paper-line bg-paper text-ink"
        }`}
      >
        {text}
      </div>
    </div>
  );
}

function ThinkingIndicator({ exiting }) {
  return (
    <div className="flex justify-start">
      <div
        className={`flex items-center gap-1 rounded-2xl border border-paper-line bg-paper px-4 py-3 ${
          exiting ? "animate-chat-indicator-out" : "animate-chat-message-in"
        }`}
      >
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink/40 [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink/40 [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink/40" />
      </div>
    </div>
  );
}
