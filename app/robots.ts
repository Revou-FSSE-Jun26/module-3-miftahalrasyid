import type { MetadataRoute } from "next";

/**
 * robots.txt (Next.js built-in convention), served at /robots.txt.
 * Points crawlers at the sitemap and keeps authenticated/dashboard areas out
 * of the index.
 */

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/seller", "/cart", "/orders", "/auth"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
