const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://fakestoreapi.com";

async function getHealthData() {
  const res = await fetch(`${API_BASE_URL}/products?limit=5`, {
    // Revalidate periodically rather than caching this forever or
    // re-fetching on every request.
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`Upstream API responded with ${res.status}`);
  }

  return res.json();
}

export default async function HealthPage() {
  let products = [];
  let error = null;

  try {
    products = await getHealthData();
  } catch (err) {
    error = err.message;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
      <span className="font-mono text-xs uppercase tracking-wide text-teal">
        System status
      </span>
      <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
        Health check
      </h1>
      <p className="mt-3 max-w-xl text-ink/70">
        Confirms this app can reach its data source and render live data —
        rendered entirely on the server, no client JavaScript needed.
      </p>

      <div className="mt-8 rounded-lg border border-paper-line bg-white p-4 sm:p-6">
        {error ? (
          <p className="font-mono text-sm text-red-600">
            ✕ API unreachable — {error}
          </p>
        ) : (
          <>
            <p className="mb-4 font-mono text-sm text-teal-dark">
              ✓ Fetched {products.length} products from {API_BASE_URL}
            </p>
            <ul className="flex flex-col gap-2 text-sm text-ink/70">
              {products.map((product) => (
                <li
                  key={product.id}
                  className="flex justify-between gap-4 border-b border-paper-line py-2 last:border-0"
                >
                  <span className="line-clamp-1">{product.title}</span>
                  <span className="font-mono shrink-0">
                    ${product.price.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
