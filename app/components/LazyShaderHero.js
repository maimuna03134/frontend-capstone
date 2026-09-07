"use client";

import dynamic from "next/dynamic";

// ssr: false — WebGL needs a real browser canvas, and this keeps the
// shader setup code out of the server bundle entirely.
const ShaderHero = dynamic(() => import("./ShaderHero"), {
    ssr: false,
    loading: () => (
        <div
            aria-hidden="true"
            className="absolute inset-0 animate-pulse bg-paper"
        />
    ),
});

export default function LazyShaderHero() {
    return <ShaderHero />;
}