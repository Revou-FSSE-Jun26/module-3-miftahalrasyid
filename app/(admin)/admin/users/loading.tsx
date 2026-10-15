export default function AdminUsersLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-7 w-32 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
      <div className="h-4 w-72 bg-gray-100 dark:bg-gray-900 rounded mb-6" />
      <div className="flex gap-2 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-8 w-20 bg-gray-100 dark:bg-gray-900 rounded-full"
          />
        ))}
      </div>
      <div className="border border-gray-200 dark:border-gray-800 rounded-xl divide-y divide-gray-100 dark:divide-gray-800">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 dark:bg-gray-900" />
        ))}
      </div>
    </div>
  );
}
