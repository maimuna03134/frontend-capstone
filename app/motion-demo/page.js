import Demo from "./Demo";

export const metadata = {
    title: "Motion Demo — ShopFront",
    description:
        "A stateful button component: idle, hover/focus, loading, success, and error, all as intentional transitions.",
};

export default function MotionDemoPage() {
    return (
        <div className="mx-auto max-w-3xl px-4 py-16">
            <p className="font-mono text-xs uppercase tracking-wide text-teal">
                Motion demo
            </p>
            <h1 className="mt-2 font-display text-3xl text-ink">
                Buttons with a brain
            </h1>
            <p className="mt-2 max-w-prose text-sm text-ink/70">
                One button component, two instances. Click for a real 20% random
                failure rate, or use the force triggers to see success and error on
                demand. Tab to a button and press Enter/Space to try it with a
                keyboard.
            </p>

            <div className="mt-8">
                <Demo />
            </div>
        </div>
    );
}