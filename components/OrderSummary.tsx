import { Card } from "@/components/Card";
import { formatRupiah } from "@/utils/format";

interface OrderSummaryProps {
  subtotal: number;
  tax: number;
  total: number;
  /** Optional CTA rendered under the totals (e.g. checkout button). */
  action?: React.ReactNode;
}

/**
 * Order-summary card: subtotal / tax / total, divided, with an optional CTA.
 * Matches spec 4.6 (order-summary Card with a subtotal/tax/total list + divider).
 */
export function OrderSummary({ subtotal, tax, total, action }: OrderSummaryProps) {
  return (
    <Card className="p-6 w-full sm:max-w-sm">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Order summary
      </h2>
      <dl className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-gray-600 dark:text-gray-400">Subtotal</dt>
          <dd className="text-gray-900 dark:text-gray-100">
            {formatRupiah(subtotal)}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-gray-600 dark:text-gray-400">Tax</dt>
          <dd className="text-gray-900 dark:text-gray-100">
            {formatRupiah(tax)}
          </dd>
        </div>
      </dl>

      <hr className="my-4 border-gray-200 dark:border-gray-800" />

      <div className="flex items-center justify-between">
        <span className="font-semibold text-gray-900 dark:text-gray-100">
          Total
        </span>
        <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
          {formatRupiah(total)}
        </span>
      </div>

      {action && <div className="mt-6">{action}</div>}
    </Card>
  );
}
