"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

function getMessageText(message) {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

function getErrorCopy(error) {
  const message = error?.message ?? "";

  if (message === "rate-limit") {
    return "The assistant is getting a lot of requests right now. Wait a few seconds and try again.";
  }
  if (message === "network") {
    return "Couldn't reach the assistant. Check your connection and try again.";
  }
  if (
    (typeof navigator !== "undefined" && !navigator.onLine) ||
    /fetch|network/i.test(message)
  ) {
    return "You appear to be offline. Check your connection and try again.";
  }
  return "Something went wrong on our end. Try again in a moment.";
}

const SUGGESTED_PROMPTS = [
  "I need something warm for winter under $50",
  "What's the difference between your jewelry and electronics categories?",
  "2 t-shirts at $15 each and a jacket for $60 — what's my total?",
];

const reducedMotionQuery =
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : null;

function subscribeToReducedMotion(callback) {
  reducedMotionQuery?.addEventListener("change", callback);
  return () => reducedMotionQuery?.removeEventListener("change", callback);
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    () => reducedMotionQuery?.matches ?? false,
    () => false, // server snapshot — no window during SSR
  );
}

function useDelayedFalse(value, delayMs) {
  const [delayed, setDelayed] = useState(value);
  const [prevValue, setPrevValue] = useState(value);

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
  const { messages, sendMessage, status, stop, error, regenerate } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });
  const [input, setInput] = useState("");
  const [isRetrying, setIsRetrying] = useState(false);
  const [prevStatus, setPrevStatus] = useState(status);

  const scrollRef = useRef(null);
  const bottomRef = useRef(null);
  const isPinnedRef = useRef(true);
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);

  const isBusy = status === "submitted" || status === "streaming";

  const lastMessage = messages[messages.length - 1];
  const waitingOnAssistant =
    status === "submitted" ||
    (status === "streaming" &&
      lastMessage?.role === "assistant" &&
      getMessageText(lastMessage).length === 0);

  const prefersReducedMotion = usePrefersReducedMotion();
  const showIndicator = useDelayedFalse(
    waitingOnAssistant,
    prefersReducedMotion ? 0 : 150,
  );

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

  if (status !== prevStatus) {
    setPrevStatus(status);
    if (status !== "error") setIsRetrying(false);
  }

  function handleRetry() {
    if (isRetrying) return; // ignore a second click while the first is in flight
    setIsRetrying(true);
    regenerate();
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
    <div className="flex h-[70dvh] flex-col overflow-hidden rounded-xl border border-paper-line bg-white">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-6"
      >
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-sm text-ink/50">
              Ask about sizing, materials, or which category to look in — or
              try one of these:
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => {
                    isPinnedRef.current = true;
                    sendMessage({ text: prompt });
                  }}
                  className="rounded-full border border-paper-line bg-white px-3 py-1.5 text-left text-xs text-ink/70 transition-colors duration-150 hover:border-teal hover:text-teal"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {showIndicator && <ThinkingIndicator exiting={!waitingOnAssistant} />}

        {status === "error" && (
          <div className="flex animate-chat-message-in justify-start">
            <div className="max-w-[85%] rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              <p>{getErrorCopy(error)}</p>
              <button
                type="button"
                onClick={handleRetry}
                disabled={isRetrying}
                className="mt-1 font-medium underline underline-offset-2 disabled:no-underline disabled:opacity-60"
              >
                {isRetrying ? "Retrying…" : "Retry last message"}
              </button>
            </div>
          </div>
        )}

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
          className="min-h-11 flex-1 resize-none rounded-lg border border-paper-line px-3 py-2.5 text-base outline-none focus-visible:border-teal md:text-sm"
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
  const toolParts = message.parts.filter(
    (part) => part.type === "tool-calculateCartSummary",
  );

  if (!text && toolParts.length === 0) return null;

  return (
    <div className={`flex flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}>
      {text && (
        <div
          className={`max-w-[85%] animate-chat-message-in rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ${isUser
              ? "bg-teal text-white"
              : "border border-paper-line bg-paper text-ink"
            }`}
        >
          {text}
        </div>
      )}
      {toolParts.map((part) => (
        <CartSummaryToolPart key={part.toolCallId} part={part} />
      ))}
    </div>
  );
}

function ThinkingIndicator({ exiting }) {
  return (
    <div className="flex justify-start">
      <div
        className={`max-w-[85%] space-y-2 rounded-2xl border border-paper-line bg-paper px-4 py-3 ${exiting ? "animate-chat-indicator-out" : "animate-chat-message-in"
          }`}
      >
        <div className="h-3 w-40 animate-tool-pulse-soft rounded bg-ink/10" />
        <div className="h-3 w-24 animate-tool-pulse-soft rounded bg-ink/10" />
      </div>
    </div>
  );
}

function CartSummaryToolPart({ part }) {
  switch (part.state) {
    case "input-streaming":
      return <ToolStateShell label="Reading the order..." />;

    case "input-available":
      return (
        <ToolStateShell label="Calculating totals...">
          <ul className="space-y-0.5 text-xs text-ink/50">
            {(part.input?.items ?? []).map((item, i) => (
              <li key={i}>
                {item.quantity}× {item.name}
              </li>
            ))}
          </ul>
        </ToolStateShell>
      );

    case "output-available":
      return <CartSummaryCard summary={part.output} />;

    case "output-error":
      return <CartSummaryError message={part.errorText} />;

    default:
      return null;
  }
}

function ToolStateShell({ label, children }) {
  return (
    <div
      key={label}
      className="w-full max-w-[85%] animate-tool-fade-in rounded-2xl border border-paper-line bg-paper px-4 py-3"
    >
      <div className="flex items-center gap-2 text-xs font-medium text-ink/60">
        <span className="h-1.5 w-1.5 animate-tool-pulse-soft rounded-full bg-teal" />
        {label}
      </div>
      {children && <div className="mt-2">{children}</div>}
    </div>
  );
}

function CartSummaryCard({ summary }) {
  if (!summary) return null;
  const { items, subtotal, tax, shipping, total, currency } = summary;
  const format = (n) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(n);

  return (
    <div
      key="output-available"
      className="w-full max-w-[85%] animate-tool-fade-in overflow-hidden rounded-2xl border border-paper-line bg-white"
    >
      <div className="border-b border-paper-line bg-paper px-4 py-2 text-xs font-medium tracking-wide text-ink/60 uppercase">
        Order summary
      </div>
      <ul className="divide-y divide-paper-line px-4">
        {items.map((item, i) => (
          <li key={i} className="flex items-center justify-between gap-3 py-2 text-sm">
            <span className="text-ink/80">
              {item.quantity} × {item.name}
            </span>
            <span className="font-medium text-ink">{format(item.lineTotal)}</span>
          </li>
        ))}
      </ul>
      <div className="space-y-1 border-t border-paper-line px-4 py-3 text-sm">
        <div className="flex justify-between text-ink/60">
          <span>Subtotal</span>
          <span>{format(subtotal)}</span>
        </div>
        <div className="flex justify-between text-ink/60">
          <span>Tax</span>
          <span>{format(tax)}</span>
        </div>
        <div className="flex justify-between text-ink/60">
          <span>Shipping</span>
          <span>{shipping === 0 ? "Free" : format(shipping)}</span>
        </div>
        <div className="flex justify-between border-t border-paper-line pt-1.5 text-base font-semibold text-teal-dark">
          <span>Total</span>
          <span>{format(total)}</span>
        </div>
      </div>
    </div>
  );
}

function CartSummaryError({ message }) {
  return (
    <div
      key="output-error"
      className="w-full max-w-[85%] animate-tool-fade-in rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      <p className="font-medium">Couldn&apos;t calculate the total</p>
      <p className="mt-0.5 text-red-600/90">
        {message || "Something went wrong reading the order."}
      </p>
    </div>
  );
}
