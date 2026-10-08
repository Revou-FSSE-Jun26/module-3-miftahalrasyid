"use client";

import { useCart } from "@/context/CartContext";
import { useState } from "react";

interface AddToCartButtonProps {
  sellerProductId: number;
  inStock: boolean;
}

/**
 * Client "Add to cart" button for the product detail page. Adds the listing to
 * the account cart (server-backed via CartContext). Keeps the existing styling.
 */
export function AddToCartButton({ sellerProductId, inStock }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [status, setStatus] = useState<"idle" | "adding" | "added" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleAdd = async () => {
    setStatus("adding");
    setMessage(null);
    const ok = await addItem(sellerProductId);
    if (ok) {
      setStatus("added");
      setTimeout(() => setStatus("idle"), 1500);
    } else {
      setStatus("error");
      setMessage("Couldn't add to cart. It may be out of stock.");
      setTimeout(() => setStatus("idle"), 2500);
    }
  };

  const label =
    !inStock
      ? "Currently unavailable"
      : status === "adding"
        ? "Adding…"
        : status === "added"
          ? "Added ✓"
          : "Add to cart";

  return (
    <div className="w-full">
      <button
        onClick={handleAdd}
        disabled={!inStock || status === "adding"}
        className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 ${inStock
            ? "bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-lg hover:shadow-xl disabled:opacity-70"
            : "bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
          }`}
      >
        {label}
      </button>
      {status === "error" && message && (
        <p className="mt-2 text-sm text-rose-600" role="alert">
          {message}
        </p>
      )}
    </div>
  );
}
