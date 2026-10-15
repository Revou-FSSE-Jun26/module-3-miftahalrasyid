export default function AdminCategoriesLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-7 w-40 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
      <div className="h-4 w-72 bg-gray-100 dark:bg-gray-900 rounded mb-6" />
      <div className="h-16 border border-gray-200 dark:border-gray-800 rounded-xl mb-6" />
      <div className="border border-gray-200 dark:border-gray-800 rounded-xl divide-y divide-gray-100 dark:divide-gray-800">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 dark:bg-gray-900" />
        ))}
      </div>
    </div>
  );
}
