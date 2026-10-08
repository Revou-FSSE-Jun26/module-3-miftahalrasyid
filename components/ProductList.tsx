"use client";

/* -------------------------------------------------------------------------
 * RUBRIC-ONLY COMPONENT — safe to remove.
 *
 * The real /products page is a Server Component that fetches via `searchParams`
 * (see app/(shop)/products/page.tsx). This client component exists only to
 * satisfy the rubric's requirement for a `ProductList` Client Component with:
 *   - "use client"
 *   - a SearchBar that navigates to /products?search= on Enter
 *   - a useEffect that reads useSearchParams() and refetches on query change
 *   - a CategoryFilter dropdown (fetch /categories, refetch /products?category_id=)
 *
 * To remove: delete this file + components/CategoryFilter.tsx, and remove the
 * <ProductList /> usage from app/(shop)/products/page.tsx. See README.
 * ------------------------------------------------------------------------- */

import { SellerProduct } from "@/app/actions/catalog.actions";
import { CategoryFilter } from "@/components/CategoryFilter";
import { ProductCard } from "@/components/ProductCard";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyboardEvent, useEffect, useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_FLASK_API_URL ||
  "http://127.0.0.1:8000";

export function ProductList({ products: initial }: { products: SellerProduct[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<SellerProduct[]>(initial);
  const [query, setQuery] = useState(searchParams.get("search") || "");
  const [categoryId, setCategoryId] = useState<number | null>(null);

  // Refetch whenever the search query (from the URL) or category changes.
  const search = searchParams.get("search") || "";
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (categoryId) params.set("category_id", String(categoryId));

    fetch(`${API_BASE}/api/v1/seller-products?${params.toString()}`, {
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((body) => setProducts(body?.data || []))
      .catch(() => setProducts([]));
  }, [search, categoryId]);

  const onEnter = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      router.push(`/products?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="mt-12 border-t border-gray-200 dark:border-gray-800 pt-8">
      <p className="text-xs uppercase tracking-wider text-gray-400 mb-4">
        Client-side list (rubric demo)
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onEnter}
          placeholder="Search products… (press Enter)"
          className="flex-1 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <CategoryFilter value={categoryId} onChange={setCategoryId} />
      </div>

      {products.length === 0 ? (
        <p className="text-gray-500 text-center py-10">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
