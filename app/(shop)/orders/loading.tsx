export default function OrdersLoading() {
  return (
    <div className="py-8 animate-pulse">
      <div className="h-8 w-40 bg-gray-200 dark:bg-gray-800 rounded mb-8" />
      <div className="border border-gray-200 dark:border-gray-800 rounded-xl divide-y divide-gray-100 dark:divide-gray-800">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 bg-gray-100 dark:bg-gray-900" />
        ))}
      </div>
    </div>
  );
}
