import { ReactNode } from "react";

/**
 * Nested layout for all /products routes (list + detail).
 * Because it's a shared layout segment, it stays mounted while navigating
 * between /products and /products/[id] — only the page slot re-renders.
 */
export default function ProductsLayout({ children }: { children: ReactNode }) {
  return <section className="products-section">{children}</section>;
}
