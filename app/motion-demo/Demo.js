"use client";

import { useRef } from "react";
import StatefulButton from "./StatefulButton";

function fakeRequest(forcedOutcome) {
    return new Promise((resolve, reject) => {
        const delay = 400 + Math.random() * 900;
        setTimeout(() => {
            const shouldFail =
                forcedOutcome === "error" ||
                (forcedOutcome !== "success" && Math.random() < 0.2);
            if (shouldFail) reject(new Error("simulated failure"));
            else resolve();
        }, delay);
    });
}

export default function Demo() {
    const sendRef = useRef(null);
    const cartRef = useRef(null);

    return (
        <div className="space-y-12">
            <DemoRow
                title="Send message"
                description="Real 20% random failure rate — click it a few times to see both outcomes naturally, or force one below."
                buttonRef={sendRef}
            >
                <StatefulButton
                    ref={sendRef}
                    tone="teal"
                    action={fakeRequest}
                    idleLabel="Send message"
                    loadingLabel="Sending..."
                    successLabel="Sent!"
                    errorLabel="Retry"
                    icon={<SendIcon />}
                />
            </DemoRow>

            <DemoRow
                title="Add to cart"
                description="Same component, different copy/icon/tone — proving the motion language is a system, not a one-off."
                buttonRef={cartRef}
            >
                <StatefulButton
                    ref={cartRef}
                    tone="mustard"
                    action={fakeRequest}
                    idleLabel="Add to cart"
                    loadingLabel="Adding..."
                    successLabel="Added!"
                    errorLabel="Retry"
                    icon={<CartIcon />}
                />
            </DemoRow>

            <section className="rounded-xl border border-paper-line bg-paper px-5 py-4 text-sm text-ink/70">
                <h2 className="font-display text-base text-ink">
                    Duration &amp; easing choices
                </h2>
                <ul className="mt-2 list-disc space-y-1.5 pl-5">
                    <li>
                        <strong className="text-ink">150ms ease-out</strong> for
                        hover/press (background-color, active:scale) — fast enough to
                        feel like a direct response to the cursor, not a delayed effect.
                    </li>
                    <li>
                        <strong className="text-ink">200ms ease-out</strong> for the
                        idle/loading/error cross-fades — matches the
                        <code className="mx-1 rounded bg-white px-1 py-0.5 text-xs">
                            tool-fade-in
                        </code>
                        timing already used for the assistant&apos;s tool cards, so the
                        whole app shares one motion vocabulary.
                    </li>
                    <li>
                        <strong className="text-ink">200ms with a small overshoot</strong>{" "}
                        (cubic-bezier(0.34, 1.56, 0.64, 1)) for the success checkmark —
                        success is the one moment worth a tiny bit of delight instead of
                        a flat linear fade.
                    </li>
                    <li>
                        <strong className="text-ink">400ms shake</strong> on error,
                        transform-only (translateX) — skipped entirely under
                        prefers-reduced-motion (see the global rule in globals.css); the
                        red color and &quot;Retry&quot; label still carry the message
                        without any motion.
                    </li>
                    <li>
                        All layers live in the same grid cell and animate only{" "}
                        <code className="mx-1 rounded bg-white px-1 py-0.5 text-xs">
                            opacity
                        </code>{" "}
                        /
                        <code className="mx-1 rounded bg-white px-1 py-0.5 text-xs">
                            transform
                        </code>{" "}
                        — the button&apos;s box size never changes, so there&apos;s no
                        layout thrash to reflow around it.
                    </li>
                </ul>
            </section>
        </div>
    );
}

function DemoRow({ title, description, buttonRef, children }) {
    return (
        <div className="rounded-xl border border-paper-line bg-white p-6">
            <h2 className="font-display text-lg text-ink">{title}</h2>
            <p className="mt-1 max-w-prose text-sm text-ink/60">{description}</p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
                {children}
                <button
                    type="button"
                    onClick={() => buttonRef.current?.run("success")}
                    className="rounded-lg border border-paper-line px-3 py-2 text-xs font-medium text-ink/70 transition-colors duration-150 hover:border-teal hover:text-teal"
                >
                    Force success
                </button>
                <button
                    type="button"
                    onClick={() => buttonRef.current?.run("error")}
                    className="rounded-lg border border-paper-line px-3 py-2 text-xs font-medium text-ink/70 transition-colors duration-150 hover:border-red-600 hover:text-red-600"
                >
                    Force error
                </button>
            </div>
        </div>
    );
}

function SendIcon() {
    return (
        <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M22 2 11 13" />
            <path d="M22 2 15 22l-4-9-9-4Z" />
        </svg>
    );
}

function CartIcon() {
    return (
        <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
    );
}