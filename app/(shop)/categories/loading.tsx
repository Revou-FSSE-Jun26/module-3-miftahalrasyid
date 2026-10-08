export default function CategoriesLoading() {
  return (
    <div className="py-8 animate-pulse">
      <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded mx-auto mb-10" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-28 bg-gray-200 dark:bg-gray-800 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
