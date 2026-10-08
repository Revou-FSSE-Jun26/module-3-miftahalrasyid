import { getMyOrders } from "@/app/actions/orders.actions";
import { getSession } from "@/app/lib/sessions";
import { formatRupiah } from "@/utils/format";
import { redirect } from "next/navigation";

export const metadata = {
  title: "My Orders",
  description: "View your orders and their status on RovoDevShop.",
};

function statusClasses(status: string) {
  switch (status) {
    case "PAID":
      return "bg-blue-100 text-blue-700";
    case "COMPLETED":
      return "bg-green-100 text-green-700";
    case "CANCELED":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-amber-100 text-amber-700"; // PENDING
  }
}

export default async function OrdersPage() {
  // Auth-only: guests are redirected to login.
  const session = await getSession();
  if (!session) {
    redirect("/auth/login?next=/orders");
  }

  // Always the caller's own purchases, regardless of role (via /orders/mine).
  // The all/incoming views live in the seller/admin dashboard, not here.
  const orders = await getMyOrders();

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        My Orders
      </h1>
      <p className="text-gray-500 mb-8">Your order history and current status</p>

      {orders.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
          <div className="text-4xl mb-4">🧾</div>
          <p className="text-gray-600 dark:text-gray-400 mb-2">No orders yet.</p>
          <a href="/products" className="text-indigo-600 hover:underline text-sm">
            Start shopping
          </a>
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-xl">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-[#1a1a1a] text-sm text-gray-600 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {orders.map((order) => (
                <tr key={order.id} className="text-sm">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                    {order.name || `Order #${order.id}`}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusClasses(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {formatRupiah(order.total)}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(order.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
