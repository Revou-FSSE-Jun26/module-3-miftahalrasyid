import type { MetadataRoute } from "next";
import { getCatalogues } from "@/app/actions/catalog.actions";
import { getCategories } from "@/app/actions/categories.actions";

/**
 * Dynamic sitemap (Next.js built-in convention). Served at /sitemap.xml.
 *
 * Combines static marketing/storefront routes with dynamic product-detail and
 * category URLs pulled from the public API. Auth-only areas (seller/admin,
 * cart, orders) are intentionally excluded — they're not meant for crawlers.
 *
 * Set NEXT_PUBLIC_SITE_URL to the production origin (e.g. https://shop.example.com)
 * so the emitted URLs are absolute and correct.
 */

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static, publicly crawlable routes.
  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/products`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/categories`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
  ];

  // Fetch dynamic data in parallel; tolerate failures so the sitemap still
  // builds (returns at least the static routes) if the API is unreachable.
  const [products, categories] = await Promise.all([
    getCatalogues().catch(() => []),
    getCategories().catch(() => []),
  ]);

  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/products/${p.id}`,
    lastModified: p.created_at ? new Date(p.created_at) : now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories
    .filter((c) => c.name)
    .map((c) => ({
      url: `${SITE_URL}/products?category=${encodeURIComponent(c.name)}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    }));

  return [...staticEntries, ...productEntries, ...categoryEntries];
}
