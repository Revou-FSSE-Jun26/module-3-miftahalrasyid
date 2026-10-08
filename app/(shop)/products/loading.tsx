/**
 * Products route loading UI — skeleton grid shown while the server component
 * fetches data. Rendered automatically by Next via Suspense.
 */
export default function ProductsLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-56 bg-gray-200 dark:bg-gray-800 rounded mx-auto mb-6" />
      <div className="h-10 w-full md:max-w-md bg-gray-200 dark:bg-gray-800 rounded mx-auto mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
          >
            <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-800" />
            <div className="p-5 space-y-3">
              <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-800 rounded" />
              <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-800 rounded" />
              <div className="h-7 w-2/5 bg-gray-200 dark:bg-gray-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
