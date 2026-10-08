import { Add } from "@mui/icons-material";
import Link from "next/link";

/**
 * Dashboard page header: title + subtitle on the left, a "Create" (+) action
 * on the right linking to the given `createHref`.
 */
export function PageHeader({
  title,
  subtitle,
  createHref,
  createLabel = "New",
}: {
  title: string;
  subtitle?: string;
  createHref: string;
  createLabel?: string;
}) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {title}
        </h1>
        {subtitle && (
          <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
        )}
      </div>
      <Link
        href={createHref}
        className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shrink-0"
      >
        <Add fontSize="small" />
        {createLabel}
      </Link>
    </div>
  );
}
