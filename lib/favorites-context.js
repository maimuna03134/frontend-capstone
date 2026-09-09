"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

const FavoritesContext = createContext(null);
const STORAGE_KEY = "shopfront:favorites";

function readStoredFavorites() {
    if (typeof window === "undefined") return [];
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function FavoritesProvider({ children }) {
    const [items, setItems] = useState(readStoredFavorites);

    useEffect(() => {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        } catch {
            // Same tradeoff as CartProvider — persistence is best-effort.
        }
    }, [items]);

    const isFavorite = useCallback(
        (id) => items.some((item) => item.id === id),
        [items],
    );

    const toggleFavorite = useCallback((product) => {
        setItems((prev) => {
            const exists = prev.some((item) => item.id === product.id);
            if (exists) {
                return prev.filter((item) => item.id !== product.id);
            }
            return [
                ...prev,
                {
                    id: product.id,
                    title: product.title,
                    price: product.price,
                    image: product.image,
                    category: product.category,
                    rating: product.rating,
                },
            ];
        });
    }, []);

    const removeFavorite = useCallback((id) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
    }, []);

    const value = useMemo(
        () => ({
            items,
            count: items.length,
            isFavorite,
            toggleFavorite,
            removeFavorite,
        }),
        [items, isFavorite, toggleFavorite, removeFavorite],
    );

    return (
        <FavoritesContext.Provider value={value}>
            {children}
        </FavoritesContext.Provider>
    );
}

export function useFavorites() {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error("useFavorites must be used within a FavoritesProvider");
    }
    return context;
}