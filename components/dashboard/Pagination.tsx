import Link from "next/link";

/**
 * Server-rendered pagination. Builds page links by cloning the current query
 * string and swapping the `page` param, so other filters (search, status) are
 * preserved. Renders nothing when there's a single page.
 */
export function Pagination({
  page,
  perPage,
  total,
  basePath,
  query = {},
}: {
  page: number;
  perPage: number;
  total: number;
  basePath: string;
  query?: Record<string, string | undefined>;
}) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  if (totalPages <= 1) return null;

  const hrefFor = (p: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) {
      if (v) params.set(k, v);
    }
    params.set("page", String(p));
    return `${basePath}?${params.toString()}`;
  };

  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  const linkCls =
    "px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors duration-150";
  const disabledCls =
    "px-3 py-1.5 text-sm rounded-md border border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed";

  return (
    <nav id="miftah-pagination" className="mt-6 flex items-center justify-between gap-4">
      <p className="text-sm text-gray-500">
        Page {page} of {totalPages} · {total} total
      </p>
      <div className="flex gap-2">
        {prevDisabled ? (
          <span className={disabledCls} aria-disabled="true">
            Previous
          </span>
        ) : (
          <Link href={hrefFor(page - 1)} className={linkCls}>
            Previous
          </Link>
        )}
        {nextDisabled ? (
          <span className={disabledCls} aria-disabled="true">
            Next
          </span>
        ) : (
          <Link href={hrefFor(page + 1)} className={linkCls}>
            Next
          </Link>
        )}
      </div>
    </nav>
  );
}
