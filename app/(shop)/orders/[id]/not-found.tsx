export default function OrderNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-4">🔍</div>
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Order not found
      </h2>
      <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
        This order doesn&apos;t exist, or it isn&apos;t one of your purchases.
      </p>
      <a
        href="/orders"
        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors duration-150"
      >
        Back to orders
      </a>
    </div>
  );
}
