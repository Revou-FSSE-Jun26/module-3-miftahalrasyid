"use client";

import { CatalogProduct, deleteCatalogProduct } from "@/app/actions/admin.actions";
import { formatTitle } from "@/utils/format";
import { RowActions } from "@/components/dashboard/RowActions";
import { useState, useTransition } from "react";

interface CatalogTableProps {
  products: CatalogProduct[];
  /** Superadmin may hard-delete (permanent). */
  canHardDelete?: boolean;
  basePath: string;
}

export function CatalogTable({ products, canHardDelete, basePath }: CatalogTableProps) {
  const [rows, setRows] = useState(products);
  const [pending, startTransition] = useTransition();

  const remove = (id: number, action: "soft" | "hard") => {
    const verb = action === "hard" ? "permanently delete" : "soft-delete";
    if (!confirm(`Are you sure you want to ${verb} this catalog product?`)) return;
    startTransition(async () => {
      const res = await deleteCatalogProduct(id, action);
      if (res.success) {
        setRows((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert(res.message);
      }
    });
  };

  if (rows.length === 0) {
    return (
      <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-xl py-16 text-center">
        <div className="text-4xl mb-3">📦</div>
        <p className="text-gray-600 dark:text-gray-400">No catalog products.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-xl">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 dark:bg-[#1a1a1a] text-gray-600 dark:text-gray-400">
          <tr>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Brand</th>
            <th className="px-4 py-3 font-medium">Model</th>
            <th className="px-4 py-3 font-medium">Categories</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {rows.map((p) => (
            <tr key={p.id} className="text-gray-900 dark:text-gray-100">
              <td className="px-4 py-3 font-medium">{formatTitle(p.name)}</td>
              <td className="px-4 py-3">{p.brand}</td>
              <td className="px-4 py-3 text-gray-500">{p.model || "—"}</td>
              <td className="px-4 py-3 text-gray-500">
                {p.categories && p.categories.length > 0
                  ? p.categories.join(", ")
                  : "—"}
              </td>
              <td className="px-4 py-3">
                {p.deleted_at ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-700">
                    Deleted
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                    Active
                  </span>
                )}
              </td>
              <td className="px-4 py-3">
                <RowActions
                  editHref={`${basePath}/${p.id}/edit`}
                  onSoftDelete={() => remove(p.id, "soft")}
                  onHardDelete={() => remove(p.id, "hard")}
                  canHardDelete={canHardDelete}
                  disabled={pending}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
