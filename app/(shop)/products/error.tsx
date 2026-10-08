"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Products route error boundary. Catches errors thrown while rendering the
 * products pages (including thrown ApiError from the data layer) and shows a
 * friendly recovery UI with a retry action.
 */
export default function ProductsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log for observability; replace with your logger if desired.
    console.error("Products route error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-4">⚠️</div>
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Something went wrong loading products
      </h2>
      <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
        We couldn&apos;t load this page right now. This is usually temporary —
        please try again.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
        >
          Try again
        </button>
        <Link
          href="/"
          className="px-5 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
