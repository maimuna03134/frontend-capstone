import LazyProductScene from "./LazyProductScene";

export const metadata = {
    title: "3D Product Preview — ShopFront",
    description:
        "An interactive 3D mug preview with a live color and finish configurator.",
};

export default function ThreeDPreviewPage() {
    return (
        <div className="mx-auto max-w-3xl px-4 py-16">
            <p className="font-mono text-xs uppercase tracking-wide text-teal">
                3D preview
            </p>
            <h1 className="mt-2 font-display text-3xl text-ink">
                Product configurator
            </h1>
            <p className="mt-2 max-w-prose text-sm text-ink/70">
                Drag to rotate, pinch or scroll to zoom, and try a color or finish
                below.
            </p>

            <div className="mt-8">
                <LazyProductScene />
            </div>
        </div>
    );
}