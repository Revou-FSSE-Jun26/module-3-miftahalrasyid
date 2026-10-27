interface AddToCartButtonProps {
  sellerProductId: number;
  inStock: boolean;
  status: "idle" | "adding" | "added" | "error";
  message: string | null;
  handleAdd: () => void
  /**
   * "full" (default) = large full-width button for the main action area.
   * "compact" = smaller inline button for the sticky mobile bar.
   */
  variant?: "full" | "compact";
}

/**
 * Client "Add to cart" button for the product detail page. Adds the listing to
 * the account cart (server-backed via CartContext). Keeps the existing styling.
 */
export default function AddToCartButton({
  sellerProductId,
  inStock,
  status,
  message,
  variant = "full",
  handleAdd
}: AddToCartButtonProps) {


  const compact = variant === "compact";

  const label = compact
    ? !inStock
      ? "Sold out"
      : status === "adding"
        ? "Adding…"
        : status === "added"
          ? "Added ✓"
          : "Add to cart"
    : !inStock
      ? "Currently unavailable"
      : status === "adding"
        ? "Adding…"
        : status === "added"
          ? "Added ✓"
          : "Add to cart";

  if (compact) {
    return (
      <button
        onClick={handleAdd}
        data-testid={`product-details_add-to-cart_compact-${sellerProductId}`}
        disabled={!inStock || status === "adding"}
        className={`px-6 py-3 rounded-lg font-semibold transition-all ${inStock
          ? "bg-[#2563eb] hover:bg-[#1d4ed8] text-white disabled:opacity-70"
          : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
          }`}
      >
        {label}
      </button>
    );
  }

  return (
    <div className="flex-1">
      <button
        onClick={handleAdd}
        data-testid={`product-details_add-to-cart_full-${sellerProductId}`}
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
    </div >
  );
}
