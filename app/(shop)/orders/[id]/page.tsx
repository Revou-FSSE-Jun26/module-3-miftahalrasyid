import { getMyOrderById } from "@/app/actions/orders.actions";
import { getSession } from "@/app/lib/sessions";
import { formatRupiah, formatTitle } from "@/utils/format";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Order #${id}`,
    description: `Items and totals for order #${id} on RovoDevShop.`,
  };
}

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

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Auth-only, same guard as the list page.
  const session = await getSession();
  if (!session) {
    redirect(`/auth/login?next=/orders/${id}`);
  }

  // getMyOrderById pulls from /orders/mine, so a non-owner id simply isn't found.
  const order = await getMyOrderById(id);
  if (!order) {
    notFound();
  }

  const items = order.items ?? [];
  const createdLabel = new Date(order.created_at).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="py-8">
      <a
        href="/orders"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 mb-6 transition-colors duration-150"
      >
        <span aria-hidden="true">←</span> Back to orders
      </a>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {order.name || `Order #${order.id}`}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Order #{order.id} · {createdLabel}
          </p>
        </div>
        <span
          className={`px-3 py-1.5 rounded-full text-sm font-medium ${statusClasses(order.status)}`}
        >
          {order.status}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
          <div className="text-4xl mb-4">📦</div>
          <p className="text-gray-600 dark:text-gray-400">
            This order has no line items.
          </p>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Items */}
          <section className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-[#1a1a1a] text-sm text-gray-600 dark:text-gray-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Item</th>
                    <th className="px-4 py-3 font-medium text-center">Qty</th>
                    <th className="px-4 py-3 font-medium text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {items.map((item) => (
                    <tr key={item.id ?? item.seller_product_id} className="text-sm">
                      <td className="px-4 py-3">
                        <a
                          href={`/products/${item.seller_product_id ?? item.product_id}`}
                          className="font-medium text-gray-900 dark:text-gray-100 hover:text-indigo-600 transition-colors duration-150"
                        >
                          {formatTitle(item.product_name)}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-300">
                        {item.quantity ?? 1}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                        {formatRupiah(item.compound_price ?? 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Totals */}
          <aside className="border border-gray-200 dark:border-gray-800 rounded-xl p-5 h-fit">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Summary
            </h2>
            <dl className="space-y-2.5 text-sm">
              {order.subtotal !== undefined && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Subtotal</dt>
                  <dd className="text-gray-700 dark:text-gray-300">
                    {formatRupiah(order.subtotal)}
                  </dd>
                </div>
              )}
              {!!order.discount_amount && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">
                    Discount
                    {order.discount_percent ? ` (${order.discount_percent}%)` : ""}
                  </dt>
                  <dd className="text-emerald-600">
                    -{formatRupiah(order.discount_amount)}
                  </dd>
                </div>
              )}
              {order.tax_amount !== undefined && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">
                    Tax{order.tax_percent ? ` (${order.tax_percent}%)` : ""}
                  </dt>
                  <dd className="text-gray-700 dark:text-gray-300">
                    {formatRupiah(order.tax_amount)}
                  </dd>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-200 dark:border-gray-800 pt-3 mt-1">
                <dt className="font-semibold text-gray-900 dark:text-gray-100">
                  Total
                </dt>
                <dd className="font-semibold text-gray-900 dark:text-gray-100">
                  {formatRupiah(order.total)}
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      )}
    </div>
  );
}
