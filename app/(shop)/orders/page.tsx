import { getMyOrders } from "@/app/actions/orders.actions";
import { getSession } from "@/app/lib/sessions";
import { getMyAddresses } from '@/app/actions/address.actions';
import { formatRupiah } from "@/utils/format";
import { redirect, } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs"

import PaymentButton from "@/components/PaymentButton";

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
  const addresses = await getMyAddresses();
  const defaultAddress = addresses.find((a) => a.is_default);

  return (
    <div className="py-8">
      <Breadcrumbs />
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
        <>
          {/* Mobile (<md): stacked cards. One block per order. */}
          <ul className="md:hidden space-y-4">
            {orders.map((order) => (
              <li
                key={order.id}
                className="border border-gray-200 dark:border-gray-800 rounded-xl p-4"
              >
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500">Order</dt>
                    <dd className="font-medium text-gray-900 dark:text-gray-100 text-right">
                      {order.name || `Order #${order.id}`}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 items-center">
                    <dt className="text-gray-500">Status</dt>
                    <dd>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusClasses(order.status)}`}>
                        {order.status}
                      </span>
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500">Total</dt>
                    <dd className="text-gray-700 dark:text-gray-300 text-right">
                      {formatRupiah(order.total)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-500">Created</dt>
                    <dd className="text-gray-500 text-right">
                      {new Date(order.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </dd>
                  </div>
                </dl>
                {order.status === "PENDING" && <PaymentButton variant="mobile" orderId={order.id} addressId={defaultAddress?.id} />}
                <a
                  href={`/orders/${order.id}`}
                  className="mt-4 w-full inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700 rounded-md hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors duration-150"
                >
                  See details
                  <span aria-hidden="true">→</span>
                </a>
              </li>
            ))}
          </ul>

          {/* Desktop (md+): table. */}
          <div className="hidden md:block overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-xl">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-[#1a1a1a] text-sm text-gray-600 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium text-right">Details</th>
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
                    <td className="flex gap-2 justify-end px-4 py-3 text-right">

                      {order.status === "PENDING" && <PaymentButton orderId={order.id} addressId={defaultAddress?.id} />}
                      <a
                        href={`/orders/${order.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700 rounded-md hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors duration-150"
                      >
                        See details
                        <span aria-hidden="true">→</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
