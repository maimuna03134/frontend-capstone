import Link from "next/link";
import { getCategoriesFrom, getProducts } from "@/lib/products";
import CatalogGrid from "./components/CatalogGrid";
import LazyShaderHero from "./components/LazyShaderHero";

export const metadata = {
  title: "ShopFront",
  description:
    "Shop clothing, jewelry, and electronics — with an AI assistant on hand for sizing help and instant order totals.",
};

export default async function HomePage() {
  const products = await getProducts();
  const categories = getCategoriesFrom(products);

  return (
    <div>
      <div className="relative h-[50dvh] min-h-[320px] w-full overflow-hidden">
        <LazyShaderHero />
        <div className="relative z-10 flex h-full items-center justify-center px-4">
          <div className="max-w-lg rounded-2xl bg-paper/80 p-6 text-center backdrop-blur-md sm:p-8">
            <p className="font-mono text-xs uppercase tracking-wide text-teal">
              ShopFront
            </p>
            <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
              Shop smarter, with help
            </h1>
            <p className="mt-2 text-sm text-ink/70">
              Browse the catalog below, or ask the{" "}
              <Link href="/assistant" className="underline hover:text-teal">
                AI assistant
              </Link>{" "}
              for sizing help and instant order totals.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <CatalogGrid products={products} categories={categories} />
      </div>
    </div>
  );
}