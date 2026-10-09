"use client";

/* -------------------------------------------------------------------------
 * RUBRIC-ONLY COMPONENT — safe to remove.
 * A category dropdown that fetches GET /categories on mount. Pairs with
 * ProductList (also rubric-only). Not used by the main UI. See README.
 * ------------------------------------------------------------------------- */

import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_FLASK_API_URL || "http://127.0.0.1:8000";


interface CategoryOption {
  id?: number;
  name: string;
}

export function CategoryFilter({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (id: number | null) => void;
}) {
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  // Fetch categories once on mount.
  useEffect(() => {
    fetch(`${API_BASE}/api/v1/categories`, { cache: "no-store" })
      .then((res) => res.json())
      .then((body) => setCategories(body?.data || []))
      .catch(() => setCategories([]));
  }, []);

  return (
    <select
      aria-label="Filter by category"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
      className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      <option value="">All categories</option>
      {categories
        .filter((c) => typeof c.id === "number")
        .map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
    </select>
  );
}
