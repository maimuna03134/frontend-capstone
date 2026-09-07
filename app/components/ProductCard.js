"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import StatefulButton from "./StatefulButton";

// Cart/favorites don't have real persistence yet (that's Phase 2 — a
// cart/favorites context wired to localStorage, then Firebase). For now
// the button gives real, honest feedback about what actually happened
// (a toast, not a silent no-op) without pretending there's a cart page
// to go look at yet.
function addToCart(product) {
    return new Promise((resolve) => {
        setTimeout(() => {
            toast.success(`Added "${product.title}" to cart`, {
                description: "Cart page is coming in the next build phase.",
            });
            resolve();
        }, 400);
    });
}

function StarRating({ rate, count }) {
    const rounded = Math.round(rate);
    return (
        <div className="flex items-center gap-1 text-xs text-ink/70">
            <div className="flex text-mustard" aria-hidden="true">
                {Array.from({ length: 5 }, (_, i) => (
                    <span key={i}>{i < rounded ? "★" : "☆"}</span>
                ))}
            </div>
            <span>
                {rate.toFixed(1)} ({count})
            </span>
        </div>
    );
}

export default function ProductCard({ product }) {
    const [isFavorite, setIsFavorite] = useState(false);
    const cartButtonRef = useRef(null);

    return (
        <div className="group flex flex-col overflow-hidden rounded-xl border border-paper-line bg-white transition-shadow duration-150 hover:shadow-md">
            <div className="relative aspect-square bg-paper p-6">
                <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
                    className="object-contain p-4 transition-transform duration-200 group-hover:scale-105"
                />
                <button
                    type="button"
                    onClick={() => setIsFavorite((v) => !v)}
                    aria-pressed={isFavorite}
                    aria-label={
                        isFavorite ? "Remove from favorites" : "Add to favorites"
                    }
                    className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-lg shadow-sm transition-transform duration-150 hover:scale-110"
                >
                    <span aria-hidden="true">{isFavorite ? "♥" : "♡"}</span>
                </button>
            </div>

            <div className="flex flex-1 flex-col gap-2 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-teal">
                    {product.category}
                </p>
                <h3 className="line-clamp-2 min-h-10 font-display text-base text-ink">
                    {product.title}
                </h3>
                <StarRating rate={product.rating.rate} count={product.rating.count} />
                <div className="mt-auto flex items-center justify-between pt-2">
                    <span className="font-display text-lg text-ink">
                        ${product.price.toFixed(2)}
                    </span>
                    <StatefulButton
                        ref={cartButtonRef}
                        tone="teal"
                        size="compact"
                        action={() => addToCart(product)}
                        idleLabel="Add to cart"
                        loadingLabel="Adding..."
                        successLabel="Added!"
                        errorLabel="Retry"
                    />
                </div>
            </div>
        </div>
    );
}