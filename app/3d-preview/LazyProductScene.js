"use client";

import dynamic from "next/dynamic";

// ssr: false keeps three.js/@react-three/fiber out of the server bundle
// entirely and defers loading it until this component mounts in the
// browser — the canvas is lazy-loaded, not just visually deferred.
const ProductScene = dynamic(() => import("./ProductScene"), {
    ssr: false,
    loading: () => (
        <div className="aspect-square w-full animate-pulse rounded-xl border border-paper-line bg-paper sm:aspect-video" />
    ),
});

export default function LazyProductScene() {
    return <ProductScene />;
}