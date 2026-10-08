import Link from "next/link";

/**
 * Global (root) 404 page. Rendered for any unmatched URL across the app, and
 * as the fallback for notFound() calls that aren't caught by a more specific
 * segment not-found.tsx. Lives at the app root, so it renders without the
 * (shop) Header/Footer shell — hence its own full-screen layout.
 */
export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0a] px-6 text-center">
      <div className="text-8xl font-extrabold text-gray-200 dark:text-gray-800 mb-2">
        404
      </div>
      <div className="text-5xl mb-4">🧭</div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        Page not found
      </h1>
      <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
        >
          Back to home
        </Link>
        <Link
          href="/products"
          className="px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Browse products
        </Link>
      </div>
    </main>
  );
}
