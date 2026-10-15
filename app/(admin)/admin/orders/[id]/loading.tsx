export default function AdminOrderDetailLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded mb-6" />
      <div className="h-7 w-56 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
      <div className="h-4 w-44 bg-gray-100 dark:bg-gray-900 rounded mb-8" />
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="border border-gray-200 dark:border-gray-800 rounded-xl divide-y divide-gray-100 dark:divide-gray-800">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 bg-gray-100 dark:bg-gray-900" />
          ))}
        </div>
        <div className="border border-gray-200 dark:border-gray-800 rounded-xl h-48" />
      </div>
    </div>
  );
}
