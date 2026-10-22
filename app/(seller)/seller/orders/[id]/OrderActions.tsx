"use client";

import { updateOrderStatus } from "@/app/actions/seller-orders.actions";
import type { OrderStatus } from "@/app/actions/orders.actions";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";

/**
 * Seller action controls for a single order.
 *
 * Only PAID orders are actionable (Complete / Cancel). For any other status we
 * render a plain note instead of buttons. Cancel asks for confirmation because
 * it triggers a refund + stock restore on the backend.
 */
export function OrderActions({
  orderId,
  status,
}: {
  orderId: number;
  status: OrderStatus;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (status !== "PAID") {
    return (
      <p className="text-sm text-gray-500">
        No actions available for a {status.toLowerCase()} order.
      </p>
    );
  }

  function run(next: "COMPLETED" | "CANCELED") {
    setError(null);
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, next);
      if (result.success) {
        toast.success(
          result.message ||
          (next === "COMPLETED" ? "Order completed." : "Order canceled."),
        );
        router.refresh();
      } else {
        setError(result.message);
        toast.error(result.message);
      }
    });
  }

  function onComplete() {
    run("COMPLETED");
  }

  function onCancel() {
    const ok = window.confirm(
      "Cancel this order? This refunds the buyer and returns the stock. This can't be undone.",
    );
    if (ok) run("CANCELED");
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onComplete}
          disabled={pending}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors duration-150"
        >
          {pending ? "Working…" : "Mark completed"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={pending}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors duration-150"
        >
          {pending ? "Working…" : "Cancel order"}
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="text-sm text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/30 rounded-md px-3 py-2"
        >
          {error}
        </p>
      )}
    </div>
  );
}
