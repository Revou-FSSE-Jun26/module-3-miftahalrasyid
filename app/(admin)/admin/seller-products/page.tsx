import { getMyListings } from "@/app/actions/seller.actions";
import { ProductsTable } from "@/components/dashboard/ProductsTable";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Pagination } from "@/components/dashboard/Pagination";
import { logger } from "@/utils/logger";

export const metadata = {
  title: "Seller Products",
  description: "Manage every seller listing on the platform.",
};

interface PageProps {
  searchParams: Promise<{ search?: string; page?: string }>;
}

export default async function AdminSellerProductsPage({ searchParams }: PageProps) {
  const { search, page: pageParam } = await searchParams;
  const page = Number(pageParam) > 0 ? Number(pageParam) : 1;

  // /seller-products/mine returns ALL listings (all statuses) for admin.
  const { items: products, pagination } = await getMyListings({ search, page });
  // logger.info(products, "fetch products");
  // console.log("miftah test", page);
  return (
    <div>
      <PageHeader
        title="Seller Products"
        subtitle="Every listing across all sellers, all statuses."
        createHref="/admin/seller-products/new"
        createLabel="New listing"
      />

      {/* Search */}
      <form
        action="/admin/seller-products"
        method="get"
        className="mb-6 flex gap-2 max-w-md"
      >
        <input
          type="search"
          name="search"
          defaultValue={search ?? ""}
          placeholder="Search listings"
          className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700 rounded-lg hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors duration-150"
        >
          Search
        </button>
      </form>

      <ProductsTable key={page} products={products} isAdmin basePath="/admin/seller-products" />

      <Pagination
        page={pagination.page}
        perPage={pagination.per_page}
        total={pagination.total}
        basePath="/admin/seller-products"
        query={{ search }}
      />
    </div>
  );
}
