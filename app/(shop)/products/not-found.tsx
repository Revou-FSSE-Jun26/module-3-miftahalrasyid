import Link from "next/link";

/**
 * Products route not-found UI. Rendered whenever a page in this segment calls
 * notFound() — e.g. a product detail for an id that doesn't exist. Returns a
 * 404 status automatically.
 */
export default function ProductNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="text-7xl font-extrabold text-gray-200 dark:text-gray-800 mb-2">
        404
      </div>
      <div className="text-4xl mb-4">🔍</div>
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Product not found
      </h2>
      <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
        The product you&apos;re looking for doesn&apos;t exist or may have been
        removed.
      </p>
      <div className="flex gap-3">
        <Link
          href="/products"
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
        >
          Browse products
        </Link>
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
