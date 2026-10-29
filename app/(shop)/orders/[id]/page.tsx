import { getMyOrderById } from "@/app/actions/orders.actions";
import { getSession } from "@/app/lib/sessions";
import { Card } from "@/components/Card";
import { formatRupiah, formatTitle } from "@/utils/format";
import Breadcrumbs from "@/components/Breadcrumbs"
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Stepper from "@/components/Stepper";

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
  const createdLabel = new Date(order.created_at).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const DetailItem = ({ items: [name, value] }: { items: [string, string] }) => (
    <div className="flex items-center mb-3">
      <div className="w-24 px-3 py-2 rounded-md bg-gray-100 text-center">{name}:</div>
      <p className="pl-6 text-gray-900">{value}</p>
    </div>
  )

  return (
    <div className="py-8">
      <div className="sticky top-16 z-20 bg-gray-50/75 backdrop-blur-md pb-4">
        <Link href="/orders" className="text-xs text-gray-400 hover:text-gray-600 inline-flex items-center mb-4 gap-1">
          <span>&larr;</span> Back to orders
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              {order.name || `Order #${order.id}`}
            </h1>
            <p className="text-xs md:text-sm text-gray-400 mt-1">
              Order placed · {createdLabel}
            </p>
          </div>
          <span className="px-3 py-1 text-xs font-semibold tracking-wider text-amber-700 bg-amber-100 rounded-full">
            PENDING
          </span>
        </div>
      </div>
      {items.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
          <div className="text-4xl mb-4">📦</div>
          <p className="text-gray-600 dark:text-gray-400">
            This order has no line items.
          </p>
        </div>
      ) : (<div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start mt-4">

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border space-y-6 border-gray-200 rounded-xl p-6 min-h-[120px]">
            <h3 className="text-sm font-bold text-gray-900 mb-6">
              Order Status
            </h3>
            <Stepper status={order.status} />

          </div>
          <div className="bg-white border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden p-6">
            <h3 className="text-sm font-bold text-gray-900 pb-3 mb-4 border-b-[0.5px] border-b-gray-200">
              Order Summary
            </h3>
            <table className="w-full text-left text-sm border-collapse">
              <thead className="dark:bg-[#1a1a1a] text-sm text-gray-600 dark:text-gray-400">
                <tr className="text-gray-400 font-medium">
                  <th className="pb-6 text-base font-normal">Item</th>
                  <th className="pb-6 text-base pr-4 font-normal text-center w-16">Qty</th>
                  <th className="pb-6 text-base font-normal text-right">Total</th>
                </tr>
              </thead>
              <tbody className="text-gray-800 divide-y divide-gray-100">
                {items.map((item) => (
                  <tr key={item.id ?? item.seller_product_id} className="text-sm">
                    <td className="flex flex-wrap items-center py-5">
                      <a
                        href={`/products/${item.seller_product_id ?? item.product_id}`}
                        className="font-medium text-base text-gray-700 dark:text-gray-100 hover:text-indigo-600 transition-colors duration-150"
                      >
                        <p className="mr-3 inline ">{formatTitle(item.product_name)}</p>
                      </a>
                      <span className="text-xs text-gray-500 whitespace-nowrap pointer-events-none"> {item?.compound_price && item?.quantity && formatRupiah(item.compound_price / item.quantity ?? 0)} x </span>
                    </td>
                    <td className="py-5 pr-4 text-center text-gray-600 dark:text-gray-300">
                      {item.quantity ?? 1}
                    </td>
                    <td className="py-5 text-right whitespace-nowrap text-gray-700 dark:text-gray-300">
                      {formatRupiah(item.compound_price ?? 0)}
                    </td>
                  </tr>
                ))}

              </tbody>
            </table>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 min-h-[120px]">
            <h3 className="text-sm font-bold text-gray-900 pb-3 mb-4 border-b-[0.5px] border-b-gray-200">
              Delivery Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="text-gray-600">
                <p className="text-gray-400 mb-6">Contact Detail</p>
                <DetailItem items={["Email", "Funny.clown.1112@gmail.com"]} />
                <DetailItem items={["Phone", "+62 877 2208 3048"]} />
              </div>
              <div className="text-gray-600">
                <p className="text-gray-400 mb-6">Location Detail</p>
                <DetailItem items={["Address", "JL. SAPTA NO 35"]} />
                <DetailItem items={["City", "Jakarta Selatan"]} />
                <DetailItem items={["Provice", "DKI Jakarta"]} />
                <DetailItem items={["Postcode", "12870"]} />
              </div>

            </div>

          </div>

          {/* <div className="bg-gray-100 border border-dashed border-gray-300 rounded-xl p-6 text-center text-xs text-gray-400 min-h-[500px] flex items-center justify-center">
            (Konten tambahan untuk simulasi scroll halaman...)
          </div> */}

        </div>
        {/* w-[calc(100%-3rem)] */}
        <div className="-left-1/2  md:w-auto sticky bottom-0 md:top-44 z-10">
          <div className="text-base md:text-sm md:bg-white bg-gray-50/75 backdrop-blur-md md:border md:border-gray-200 dark:border-gray-800 md:rounded-xl overflow-hidden py-6 md:p-6">
            <h2 className=" font-bold text-gray-900 mb-5">Summary</h2>
            <dl className="space-y-3">
              {order.subtotal !== undefined && (
                <div className="flex justify-between ">
                  <dt className="text-gray-500">Subtotal</dt>
                  <dd className="text-gray-800 dark:text-gray-300">
                    {formatRupiah(order.subtotal)}
                  </dd>
                </div>
              )}
              {!!order.discount_amount && (
                <div className="flex justify-between ">
                  <dt className="text-gray-500">
                    Discount
                    {order.discount_percent ? ` (${order.discount_percent}%)` : ""}
                  </dt>
                  <dd className="text-emerald-800">
                    -{formatRupiah(order.discount_amount)}
                  </dd>
                </div>
              )}
              {order.tax_amount !== undefined && (
                <div className="flex justify-between mb-5">
                  <dt className="text-gray-500">
                    Tax{order.tax_percent ? ` (${order.tax_percent}%)` : ""}
                  </dt>
                  <dd className="text-gray-800 dark:text-gray-300">
                    {formatRupiah(order.tax_amount)}
                  </dd>
                </div>
              )}
              <div className="flex justify-between items-center  font-bold text-gray-900 border-t border-gray-100 dark:border-gray-800 pt-5 mt-1">
                <dt className="font-semibold text-gray-900 dark:text-gray-100">
                  Total
                </dt>
                <dd className="text-base text-gray-900 dark:text-gray-100">
                  {formatRupiah(order.total)}
                </dd>
              </div>
            </dl>

          </div>
        </div>

      </div>)}

    </div>
  );
}
