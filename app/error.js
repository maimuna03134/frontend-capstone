"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({ error, reset }) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <main className="mx-auto max-w-lg px-4 py-24 text-center">
            <p className="font-mono text-xs uppercase tracking-wide text-red-600">
                Something went wrong
            </p>
            <h1 className="mt-2 font-display text-2xl text-ink">
                This page hit an error
            </h1>
            <p className="mt-2 text-sm text-ink/60">
                Try reloading. If it keeps happening, head back to the homepage.
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
                    Homepage
                </Link>
            </div>
        </main>
    );
}