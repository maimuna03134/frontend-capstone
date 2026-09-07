const API_BASE = "https://fakestoreapi.com";

// FakeStoreAPI has ~20 products total — small enough to fetch once and
// filter/sort entirely client-side rather than round-tripping per query.
export async function getProducts() {
    const res = await fetch(`${API_BASE}/products`, {
        next: { revalidate: 3600 }, // demo data barely changes — cache an hour
    });
    if (!res.ok) {
        throw new Error(`Failed to load products (${res.status})`);
    }
    return res.json();
}

export async function getProduct(id) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
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