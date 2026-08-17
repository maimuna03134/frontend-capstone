"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function AssistantError({ error, reset }) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <main className="mx-auto max-w-3xl px-4 py-16 text-center">
            <p className="font-mono text-xs uppercase tracking-wide text-red-600">
                Assistant unavailable
            </p>
            <h1 className="mt-2 font-display text-2xl text-ink">
                The assistant hit a snag
            </h1>
            <p className="mt-2 text-sm text-ink/60">
                Something broke loading this page. Try again, or head back to the
                catalog while we sort it out.
            </p>
            <div className="mt-6 flex justify-center gap-3">
                <button
                    type="button"
                    onClick={reset}
                    className="rounded-lg bg-teal px-4 py-2 text-sm font-medium text-white"
                >
                    Try again
                </button>
                <Link
                    href="/"
                    className="rounded-lg border border-paper-line px-4 py-2 text-sm font-medium text-ink"
                >
                    Back to catalog
                </Link>
            </div>
        </main>
    );
}