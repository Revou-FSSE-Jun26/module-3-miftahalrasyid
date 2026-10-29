import {
  getIncomingOrders,
} from "@/app/actions/seller-orders.actions";
import type { OrderStatus } from "@/app/actions/orders.actions";
import { formatRupiah } from "@/utils/format";
import { Pagination } from "@/components/dashboard/Pagination";
import Link from "next/link";
import MoveToInboxRoundedIcon from '@mui/icons-material/MoveToInboxRounded';
export const metadata = {
  title: "Incoming Orders",
  description: "Orders placed against your listings.",
};

const STATUS_TABS: { label: string; value?: OrderStatus }[] = [
  { label: "All" },
  { label: "Paid", value: "PAID" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Canceled", value: "CANCELED" },
  { label: "Pending", value: "PENDING" },
];

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

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

const VALID_STATUSES: OrderStatus[] = [
  "PENDING",
  "PAID",
  "COMPLETED",
  "CANCELED",
];
export const dynamic = "force-dynamic";
export default async function SellerOrdersPage({ searchParams }: PageProps) {
  // Layout already enforces seller access via requireSeller().
  const { status: statusParam, page: pageParam } = await searchParams;
  const activeStatus = VALID_STATUSES.includes(statusParam as OrderStatus)
    ? (statusParam as OrderStatus)
    : undefined;
  const page = Number(pageParam) > 0 ? Number(pageParam) : 1;

  const { items: orders, pagination } = await getIncomingOrders(
    activeStatus,
    page,
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Incoming Orders
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Orders placed against your listings. You can fulfill or cancel paid
          orders.
        </p>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_TABS.map((tab) => {
          const isActive = activeStatus === tab.value;
          const href = tab.value
            ? `/seller/orders?status=${tab.value}`
            : "/seller/orders";
          return (
            <Link
              key={tab.label}
              href={href}
              className={`px-3 py-1.5 text-sm rounded-full border transition-colors duration-150 ${isActive
                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300"
                : "border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-400"
                }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
          <MoveToInboxRoundedIcon sx={{ fontSize: 36 }} />

          <p className="text-gray-600 dark:text-gray-400">
            No {activeStatus ? activeStatus.toLowerCase() : ""} orders yet.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile (<md): stacked cards. */}
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
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusClasses(order.status)}`}
                      >
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
                      {formatDate(order.created_at)}
                    </dd>
                  </div>
                </dl>
                <Link
                  href={`/seller/orders/${order.id}`}
                  className="mt-4 w-full inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700 rounded-md hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors duration-150"
                >
                  View order
                  <span aria-hidden="true">→</span>
                </Link>
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
                  <th className="px-4 py-3 font-medium">Items</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {orders.map((order) => (
                  <tr key={order.id} className="text-sm">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                      {order.name || `Order #${order.id}`}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusClasses(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {order.items?.length ?? 0}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {formatRupiah(order.total)}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/seller/orders/${order.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700 rounded-md hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors duration-150"
                      >
                        View
                        <span aria-hidden="true">→</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Pagination
        page={pagination.page}
        perPage={pagination.per_page}
        total={pagination.total}
        basePath="/seller/orders"
        query={{ status: activeStatus }}
      />
    </div>
  );
}
