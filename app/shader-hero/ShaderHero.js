"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

// Same pattern used in app/assistant/Chat.js and app/3d-preview/ProductScene.js —
// subscribing to a MediaQueryList via useSyncExternalStore rather than
// useState+useEffect. This component is only ever mounted client-side
// (see LazyShaderHero.js), so it's safe to read window here.
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
        () => false,
    );
}

function checkWebgl2Support() {
    if (typeof window === "undefined") return true;
    try {
        const canvas = document.createElement("canvas");
        return Boolean(canvas.getContext("webgl2"));
    } catch {
        return false;
    }
}

// --- Vertex shader --------------------------------------------------
// Draws one triangle big enough to cover the whole viewport (corners at
// -1,-1 / 3,-1 / -1,3). Cheaper than a quad (2 triangles, 4 vertices) for
// exactly the same visual result — a classic full-screen-shader trick.
const VERTEX_SRC = `#version 300 es
in vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

// --- Fragment shader --------------------------------------------------
const FRAGMENT_SRC = `#version 300 es
precision highp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

out vec4 outColor;

// Cheap pseudo-random hash (no texture lookups) — used for the grain pass.
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
  // Normalize to 0..1, then re-center to -0.5..0.5 and correct for aspect
  // ratio so the flow field isn't stretched into an oval on wide screens.
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = uv - 0.5;
  p.x *= u_resolution.x / u_resolution.y;

  // Mouse gently pulls the field toward the cursor (5% pull, not a hard
  // snap) — u_mouse arrives as 0..1, so it needs the same recentering.
  vec2 mouseOffset = (u_mouse - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);
  p += (mouseOffset - p) * 0.05;

  // Three sine waves at different frequencies/speeds/axes, summed. That's
  // it — no real noise function, just overlapping waves — but it reads as
  // an organic, slowly drifting flow field, and it's dramatically cheaper
  // than simplex/Perlin noise.
  float t = u_time * 0.15;
  float wave = sin(p.x * 3.0 + t) * 0.5
             + sin(p.y * 4.0 - t * 1.3) * 0.5
             + sin((p.x + p.y) * 2.5 + t * 0.7) * 0.5;
  wave = wave * 0.33 + 0.5; // roughly 0..1

  // Brand palette — the same paper/mustard/teal tokens as globals.css,
  // just as GLSL vec3s (0..1, not 0..255).
  vec3 paper = vec3(0.961, 0.965, 0.953);
  vec3 mustard = vec3(0.851, 0.643, 0.255);
  vec3 teal = vec3(0.184, 0.431, 0.404);

  // Two-step mix walks the wave value through paper -> mustard -> teal.
  vec3 color = mix(paper, mustard, smoothstep(0.2, 0.55, wave));
  color = mix(color, teal, smoothstep(0.55, 0.9, wave));

  // Soft vignette (darkens toward the edges) so attention stays centered,
  // which is also where the headline card sits.
  float vignette = smoothstep(1.1, 0.3, length(p));
  color = mix(color * 0.85, color, vignette);

  // Grain: dithers the gradient so it doesn't band, and reads as texture
  // instead of a flat, "templated" gradient.
  float grain = (hash(gl_FragCoord.xy + u_time) - 0.5) * 0.035;
  color += grain;

  outColor = vec4(color, 1.0);
}
`;

function compileShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(`Shader compile error: ${info}`);
    }
    return shader;
}

function createProgram(gl, vertexSrc, fragmentSrc) {
    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSrc);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSrc);
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const info = gl.getProgramInfoLog(program);
        gl.deleteProgram(program);
        throw new Error(`Program link error: ${info}`);
    }
    return program;
}

function StaticGradientFallback() {
    return (
        <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
                background:
                    "linear-gradient(135deg, #f5f6f3 0%, #d9a441 45%, #2f6e68 100%)",
            }}
        />
    );
}

export default function ShaderHero() {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const [webglOk] = useState(checkWebgl2Support);
    const prefersReducedMotion = usePrefersReducedMotion();
    const showShader = webglOk && !prefersReducedMotion;

    useEffect(() => {
        if (!showShader) return undefined;

        const canvas = canvasRef.current;
        const container = containerRef.current;
        const gl = canvas.getContext("webgl2");
        if (!gl) return undefined;

        const program = createProgram(gl, VERTEX_SRC, FRAGMENT_SRC);
        gl.useProgram(program);

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([-1, -1, 3, -1, -1, 3]),
            gl.STATIC_DRAW,
        );
        const positionLoc = gl.getAttribLocation(program, "a_position");
        gl.enableVertexAttribArray(positionLoc);
        gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

        const timeLoc = gl.getUniformLocation(program, "u_time");
        const resolutionLoc = gl.getUniformLocation(program, "u_resolution");
        const mouseLoc = gl.getUniformLocation(program, "u_mouse");

        const mouse = { x: 0.5, y: 0.5 };
        // Cap the pixel ratio — a shader running at 3x DPR on a phone is the
        // single fastest way to make it overheat for no visible benefit.
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        function resize() {
            const { width, height } = container.getBoundingClientRect();
            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            gl.viewport(0, 0, canvas.width, canvas.height);
        }

        function handlePointerMove(event) {
            const rect = container.getBoundingClientRect();
            mouse.x = (event.clientX - rect.left) / rect.width;
            mouse.y = 1 - (event.clientY - rect.top) / rect.height;
        }

        let rafId = null;
        let running = true;
        const startTime = performance.now();

        function draw() {
            if (!running) return;
            const elapsed = (performance.now() - startTime) / 1000;
            gl.uniform1f(timeLoc, elapsed);
            gl.uniform2f(resolutionLoc, canvas.width, canvas.height);
            gl.uniform2f(mouseLoc, mouse.x, mouse.y);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
            rafId = requestAnimationFrame(draw);
        }

        // Pause entirely when the tab isn't visible — no point burning battery
        // animating a hero nobody's looking at.
        function handleVisibilityChange() {
            if (document.hidden) {
                running = false;
                if (rafId) cancelAnimationFrame(rafId);
            } else if (!running) {
                running = true;
                draw();
            }
        }

        resize();
        draw();

        window.addEventListener("resize", resize);
        container.addEventListener("pointermove", handlePointerMove);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            running = false;
            if (rafId) cancelAnimationFrame(rafId);
            window.removeEventListener("resize", resize);
            container.removeEventListener("pointermove", handlePointerMove);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            gl.deleteProgram(program);
            gl.deleteBuffer(positionBuffer);
        };
    }, [showShader]);

    return (
        <div ref={containerRef} className="absolute inset-0 overflow-hidden">
            {showShader ? (
                <canvas ref={canvasRef} className="h-full w-full" />
            ) : (
                <StaticGradientFallback />
            )}
        </div>
    );
}