"use client";

import { createOrderFromCart } from "@/app/actions/orders.actions";
import { useCart } from "@/context/CartContext";
import { OrderSummary } from "@/components/OrderSummary";
import { formatRupiah, formatTitle } from "@/utils/format";
import { Delete } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export function CartView() {
  const router = useRouter();
  const { items, total, removeItem, updateQty, clear } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setError(null);
    setCheckingOut(true);
    const res = await createOrderFromCart(
      items.map((i) => ({
        seller_product_id: i.sellerProductId,
        quantity: i.quantity,
      })),
    );
    setCheckingOut(false);
    if (res.success) {
      clear();
      router.push("/orders");
    } else {
      setError(res.message);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
        <div className="text-4xl mb-4">🛒</div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">Your cart is empty.</p>
        <Link
          href="/products"
          className="inline-flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* LEFT: item list (spans 2 of 3 columns on desktop) */}
      <div className="lg:col-span-2 space-y-4">
        {error && (
          <div className="rounded-md bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 text-sm">
            {error}
          </div>
        )}
        <div className="border border-gray-200 dark:border-gray-800 rounded-xl divide-y divide-gray-100 dark:divide-gray-800">
          {items.map((item) => (
            <div
              key={item.sellerProductId}
              className="flex items-center gap-4 p-4"
            >
              <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-[#0a0a0a] overflow-hidden flex-shrink-0">
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image}
                    alt={formatTitle(item.title)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl">
                    📷
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                  {formatTitle(item.title)}
                </p>
                <p className="text-sm text-gray-500">
                  {formatRupiah(item.price)}
                </p>
              </div>

              {/* Qty stepper */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQty(item.sellerProductId, item.quantity - 1)}
                  className="w-7 h-7 rounded border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-6 text-center text-sm">{item.quantity}</span>
                <button
                  onClick={() => updateQty(item.sellerProductId, item.quantity + 1)}
                  className="w-7 h-7 rounded border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <div className="w-28 text-right font-medium text-gray-900 dark:text-gray-100">
                {formatRupiah(item.price * item.quantity)}
              </div>

              {/* Delete icon */}
              <button
                onClick={() => removeItem(item.sellerProductId)}
                aria-label="Remove item"
                title="Remove"
                className="p-2 rounded-md text-gray-400 hover:text-rose-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Delete fontSize="small" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: order summary (1 of 3 columns, sticky on desktop) */}
      <div className="lg:sticky lg:top-24">
        <OrderSummary
          subtotal={total}
          tax={0}
          total={total}
          action={
            <button
              onClick={handleCheckout}
              disabled={checkingOut}
              className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-60"
            >
              {checkingOut ? "Placing order…" : "Proceed to checkout"}
            </button>
          }
        />
      </div>
    </div>
  );
}
