const API_BASE = "https://fakestoreapi.com";

// Some hosts block "faceless" server-to-server requests (no realistic
// User-Agent) as bot traffic — this happened in production on Vercel
// even though the same request worked fine locally. A normal browser
// User-Agent avoids that.
const FETCH_HEADERS = {
    "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Accept: "application/json",
};

export async function getProducts() {
    const res = await fetch(`${API_BASE}/products`, {
        headers: FETCH_HEADERS,
        next: { revalidate: 3600 },
    });
    if (!res.ok) {
        throw new Error(`Failed to load products (${res.status})`);
    }
    return res.json();
}

export async function getProduct(id) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
        headers: FETCH_HEADERS,
        next: { revalidate: 3600 },
    });
    if (!res.ok) {
        throw new Error(`Failed to load product ${id} (${res.status})`);
    }
    return res.json();
}

export function getCategoriesFrom(products) {
    return Array.from(new Set(products.map((product) => product.category))).sort();
}