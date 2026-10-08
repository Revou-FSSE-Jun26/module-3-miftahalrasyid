"use client";

import { SellerProduct } from "@/app/actions/catalog.actions";
import { softDeleteListing } from "@/app/actions/seller.actions";
import { formatRupiah, formatTitle } from "@/utils/format";
import { RowActions } from "@/components/dashboard/RowActions";
import { useState, useTransition } from "react";

interface ProductsTableProps {
  products: SellerProduct[];
  /** Admin sees the seller column + can act on any row. */
  isAdmin?: boolean;
  /** Base path for the edit link, e.g. "/seller/products" or "/admin/seller-products". */
  basePath: string;
}

function statusClasses(status: string) {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-100 text-emerald-700";
    case "PENDING":
      return "bg-amber-100 text-amber-700";
    case "SUSPENDED":
    case "REJECTED":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-gray-100 text-gray-700"; // INACTIVE
  }
}

export function ProductsTable({ products, isAdmin, basePath }: ProductsTableProps) {
  const [rows, setRows] = useState(products);
  const [pending, startTransition] = useTransition();

  const handleDelete = (id: number) => {
    if (!confirm("Soft-delete this listing?")) return;
    startTransition(async () => {
      const res = await softDeleteListing(id);
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
        <p className="text-gray-600 dark:text-gray-400">No products to show.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-xl">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 dark:bg-[#1a1a1a] text-gray-600 dark:text-gray-400">
          <tr>
            <th className="px-4 py-3 font-medium">Title</th>
            {isAdmin && <th className="px-4 py-3 font-medium">Seller</th>}
            <th className="px-4 py-3 font-medium">Price</th>
            <th className="px-4 py-3 font-medium">Stock</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {rows.map((p) => (
            <tr key={p.id} className="text-gray-900 dark:text-gray-100">
              <td className="px-4 py-3 font-medium">
                {formatTitle(p.title || p.name)}
              </td>
              {isAdmin && (
                <td className="px-4 py-3 text-gray-500">#{p.seller_id}</td>
              )}
              <td className="px-4 py-3">{formatRupiah(p.price)}</td>
              <td className="px-4 py-3">{p.stock}</td>
              <td className="px-4 py-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusClasses(p.status)}`}>
                  {p.status}
                </span>
              </td>
              <td className="px-4 py-3">
                <RowActions
                  editHref={`${basePath}/${p.id}/edit`}
                  onSoftDelete={() => handleDelete(p.id)}
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
