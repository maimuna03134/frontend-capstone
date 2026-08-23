"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";

// Same pattern as usePrefersReducedMotion in app/assistant/Chat.js —
// subscribing to a MediaQueryList via useSyncExternalStore rather than
// useState+useEffect avoids an extra render and is safe to call during
// render (this component is client-only anyway: it's loaded through
// LazyProductScene's `dynamic(..., { ssr: false })`).
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

// WebGL support doesn't change during a session, so this only needs to
// run once — a lazy useState initializer runs synchronously during the
// first render, no effect required.
function checkWebglSupport() {
    if (typeof window === "undefined") return true;
    try {
        const canvas = document.createElement("canvas");
        return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
    } catch {
        return false;
    }
}

const COLORS = [
    { name: "Teal", value: "#2f6e68" },
    { name: "Mustard", value: "#d9a441" },
    { name: "Ink", value: "#1f2937" },
    { name: "Paper", value: "#e8e4d8" },
];

const FINISHES = {
    Matte: { metalness: 0.05, roughness: 0.9 },
    Satin: { metalness: 0.4, roughness: 0.35 },
    Glossy: { metalness: 0.7, roughness: 0.08 },
};

function Mug({ color, finish, autoRotate }) {
    const groupRef = useRef(null);

    useFrame((_, delta) => {
        if (autoRotate && groupRef.current) {
            groupRef.current.rotation.y += delta * 0.5;
        }
    });

    return (
        <group ref={groupRef}>
            <mesh castShadow position={[0, 0, 0]}>
                <cylinderGeometry args={[0.85, 0.75, 1.5, 48]} />
                <meshStandardMaterial
                    color={color}
                    metalness={finish.metalness}
                    roughness={finish.roughness}
                />
            </mesh>
            <mesh castShadow position={[1.0, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
                <torusGeometry args={[0.42, 0.12, 16, 32]} />
                <meshStandardMaterial
                    color={color}
                    metalness={finish.metalness}
                    roughness={finish.roughness}
                />
            </mesh>
        </group>
    );
}

function StaticFallback({ reason, onEnable }) {
    return (
        <div className="flex aspect-square w-full flex-col items-center justify-center gap-3 rounded-xl border border-paper-line bg-paper px-6 text-center sm:aspect-video">
            <div
                aria-hidden="true"
                className="h-20 w-20 rounded-full bg-gradient-to-br from-teal to-teal-dark"
            />
            <p className="max-w-xs text-sm text-ink/70">
                {reason === "webgl"
                    ? "3D isn't supported in this browser — here's a static preview instead."
                    : "The 3D view is paused for your reduced-motion preference."}
            </p>
            {reason === "motion" && (
                <button
                    type="button"
                    onClick={onEnable}
                    className="rounded-lg border border-paper-line px-3 py-1.5 text-xs font-medium text-ink/70 transition-colors duration-150 hover:border-teal hover:text-teal"
                >
                    Show the 3D view anyway
                </button>
            )}
        </div>
    );
}

function Configurator({
    color,
    onColor,
    finishName,
    onFinish,
    autoRotate,
    onToggleRotate,
}) {
    return (
        <div className="flex flex-wrap items-center gap-6 rounded-xl border border-paper-line bg-white p-4">
            <div>
                <p className="text-xs font-medium uppercase tracking-wide text-ink/70">
                    Color
                </p>
                <div className="mt-2 flex gap-2">
                    {COLORS.map((swatch) => (
                        <button
                            key={swatch.value}
                            type="button"
                            aria-label={swatch.name}
                            aria-pressed={color === swatch.value}
                            onClick={() => onColor(swatch.value)}
                            style={{ backgroundColor: swatch.value }}
                            className={`h-7 w-7 rounded-full border-2 transition-transform duration-150 ${color === swatch.value
                                    ? "scale-110 border-teal"
                                    : "border-paper-line hover:scale-105"
                                }`}
                        />
                    ))}
                </div>
            </div>

            <div>
                <p className="text-xs font-medium uppercase tracking-wide text-ink/70">
                    Finish
                </p>
                <div className="mt-2 flex gap-1.5">
                    {Object.keys(FINISHES).map((name) => (
                        <button
                            key={name}
                            type="button"
                            aria-pressed={finishName === name}
                            onClick={() => onFinish(name)}
                            className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors duration-150 ${finishName === name
                                    ? "border-teal bg-teal text-white"
                                    : "border-paper-line text-ink/70 hover:border-teal hover:text-teal"
                                }`}
                        >
                            {name}
                        </button>
                    ))}
                </div>
            </div>

            <label className="ml-auto flex items-center gap-2 text-xs text-ink/70">
                <input
                    type="checkbox"
                    checked={autoRotate}
                    onChange={onToggleRotate}
                    className="h-4 w-4 accent-teal"
                />
                Auto-rotate
            </label>
        </div>
    );
}

export default function ProductScene() {
    const [color, setColor] = useState(COLORS[0].value);
    const [finishName, setFinishName] = useState("Matte");
    const [autoRotate, setAutoRotate] = useState(true);
    const [forceMotion, setForceMotion] = useState(false);
    const [webglOk] = useState(checkWebglSupport);
    const prefersReducedMotion = usePrefersReducedMotion();

    if (!webglOk) return <StaticFallback reason="webgl" />;

    const showScene = !prefersReducedMotion || forceMotion;
    if (!showScene) {
        return (
            <StaticFallback reason="motion" onEnable={() => setForceMotion(true)} />
        );
    }

    const finish = FINISHES[finishName];

    return (
        <div className="space-y-4">
            <div className="aspect-square w-full touch-none overflow-hidden rounded-xl border border-paper-line bg-paper sm:aspect-video">
                <Canvas
                    dpr={[1, 2]}
                    camera={{ position: [2.3, 1.5, 2.6], fov: 40 }}
                    gl={{ antialias: true, powerPreference: "low-power" }}
                >
                    <ambientLight intensity={0.6} />
                    <directionalLight position={[3, 4, 2]} intensity={1.1} castShadow />
                    <directionalLight position={[-3, 2, -2]} intensity={0.3} />
                    <Mug color={color} finish={finish} autoRotate={autoRotate} />
                    <ContactShadows
                        position={[0, -0.85, 0]}
                        opacity={0.35}
                        scale={4}
                        blur={2.4}
                        far={1.2}
                    />
                    <OrbitControls
                        enablePan={false}
                        minDistance={2}
                        maxDistance={5}
                        onStart={() => setAutoRotate(false)}
                    />
                </Canvas>
            </div>

            <Configurator
                color={color}
                onColor={setColor}
                finishName={finishName}
                onFinish={setFinishName}
                autoRotate={autoRotate}
                onToggleRotate={() => setAutoRotate((v) => !v)}
            />
        </div>
    );
}