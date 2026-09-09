"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "shopfront:cart";

function readStoredCart() {
    if (typeof window === "undefined") return [];
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function CartProvider({ children }) {
    // Lazy initializer reads localStorage synchronously on first render —
    // no effect needed just to load the initial value.
    const [items, setItems] = useState(readStoredCart);

    // This one *is* a real side effect (writing to an external store on
    // every change), so it belongs in an effect — unlike loading the
    // initial value above.
    useEffect(() => {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        } catch {
            // Storage can fail (private browsing, quota) — the cart still
            // works for the session, it just won't persist across reloads.
        }
    }, [items]);

    const addItem = useCallback((product, quantity = 1) => {
        setItems((prev) => {
            const existing = prev.find((item) => item.id === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item,
                );
            }
            return [
                ...prev,
                {
                    id: product.id,
                    title: product.title,
                    price: product.price,
                    image: product.image,
                    quantity,
                },
            ];
        });
    }, []);

    const removeItem = useCallback((id) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
    }, []);

    const setQuantity = useCallback((id, quantity) => {
        setItems((prev) => {
            if (quantity <= 0) return prev.filter((item) => item.id !== id);
            return prev.map((item) =>
                item.id === id ? { ...item, quantity } : item,
            );
        });
    }, []);

    const clearCart = useCallback(() => setItems([]), []);

    const itemCount = useMemo(
        () => items.reduce((sum, item) => sum + item.quantity, 0),
        [items],
    );
    const subtotal = useMemo(
        () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        [items],
    );

    const value = useMemo(
        () => ({
            items,
            addItem,
            removeItem,
            setQuantity,
            clearCart,
            itemCount,
            subtotal,
        }),
        [items, addItem, removeItem, setQuantity, clearCart, itemCount, subtotal],
    );

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}