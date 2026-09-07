"use client";

import { useMemo, useState } from "react";
import ProductCard from "./ProductCard";

const SORT_OPTIONS = [
    { value: "featured", label: "Featured" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "name-asc", label: "Name: A to Z" },
];

export default function CatalogGrid({ products, categories }) {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");
    const [sort, setSort] = useState("featured");

    const filtered = useMemo(() => {
        let result = products;

        if (category !== "all") {
            result = result.filter((product) => product.category === category);
        }

        const query = search.trim().toLowerCase();
        if (query) {
            result = result.filter((product) =>
                product.title.toLowerCase().includes(query),
            );
        }

        const sorted = [...result];
        if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
        else if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
        else if (sort === "name-asc") {
            sorted.sort((a, b) => a.title.localeCompare(b.title));
        }

        return sorted;
    }, [products, category, search, sort]);

    function clearFilters() {
        setSearch("");
        setCategory("all");
    }

    return (
        <div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="sm:max-w-xs sm:flex-1">
                    <label htmlFor="product-search" className="sr-only">
                        Search products
                    </label>
                    <input
                        id="product-search"
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search products..."
                        className="w-full rounded-lg border border-paper-line px-3 py-2 text-sm outline-none focus-visible:border-teal"
                    />
                </div>

                <div className="flex flex-wrap gap-2">
                    <label htmlFor="category-filter" className="sr-only">
                        Filter by category
                    </label>
                    <select
                        id="category-filter"
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                        className="rounded-lg border border-paper-line bg-white px-3 py-2 text-sm capitalize outline-none focus-visible:border-teal"
                    >
                        <option value="all">All categories</option>
                        {categories.map((c) => (
                            <option key={c} value={c} className="capitalize">
                                {c}
                            </option>
                        ))}
                    </select>

                    <label htmlFor="sort-by" className="sr-only">
                        Sort by
                    </label>
                    <select
                        id="sort-by"
                        value={sort}
                        onChange={(event) => setSort(event.target.value)}
                        className="rounded-lg border border-paper-line bg-white px-3 py-2 text-sm outline-none focus-visible:border-teal"
                    >
                        {SORT_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <p role="status" className="mt-4 text-sm text-ink/70">
                {filtered.length} {filtered.length === 1 ? "product" : "products"}
            </p>

            {filtered.length === 0 ? (
                <div className="mt-8 rounded-xl border border-paper-line bg-paper p-8 text-center">
                    <p className="text-sm text-ink/70">
                        No products match your filters. Try a different search or
                        category.
                    </p>
                    <button
                        type="button"
                        onClick={clearFilters}
                        className="mt-3 rounded-lg border border-paper-line px-3 py-1.5 text-xs font-medium text-ink/70 transition-colors duration-150 hover:border-teal hover:text-teal"
                    >
                        Clear filters
                    </button>
                </div>
            ) : (
                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {filtered.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
}