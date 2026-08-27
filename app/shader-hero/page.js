import LazyShaderHero from "./LazyShaderHero";

export const metadata = {
    title: "Shader Hero — ShopFront",
    description:
        "A hand-written GLSL flow-field hero in the ShopFront brand palette.",
};

export default function ShaderHeroPage() {
    return (
        <div className="relative h-[70dvh] min-h-[420px] w-full overflow-hidden">
            <LazyShaderHero />

            <div className="relative z-10 flex h-full items-center justify-center px-4">
                <div className="max-w-lg rounded-2xl bg-paper/80 p-6 text-center backdrop-blur-md sm:p-8">
                    <p className="font-mono text-xs uppercase tracking-wide text-teal">
                        Signature hero
                    </p>
                    <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
                        ShopFront
                    </h1>
                    <p className="mt-2 text-sm text-ink/70">
                        A hand-written GLSL flow field in the brand&apos;s own colors —
                        move your cursor to nudge it.
                    </p>
                </div>
            </div>
        </div>
    );
}