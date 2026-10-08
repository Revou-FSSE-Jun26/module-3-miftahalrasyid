"use client";

import { useCart } from "@/context/CartContext";
import { useState } from "react";

interface AddToCartButtonProps {
  sellerProductId: number;
  title: string;
  price: number;
  image?: string;
  inStock: boolean;
}

/**
 * Client "Add to cart" button for the product detail page. Adds the listing to
 * the device cart (CartContext/localStorage). Keeps the existing button styling.
 */
export function AddToCartButton({
  sellerProductId,
  title,
  price,
  image,
  inStock,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem({ sellerProductId, title, price, image });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <button
      onClick={handleAdd}
      disabled={!inStock}
      className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 ${
        inStock
          ? "bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-lg hover:shadow-xl"
          : "bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
      }`}
    >
      {!inStock ? "Currently unavailable" : added ? "Added ✓" : "Add to cart"}
    </button>
  );
}
