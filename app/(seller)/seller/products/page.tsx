import { getMyListings } from "@/app/actions/seller.actions";
import { ProductsTable } from "@/components/dashboard/ProductsTable";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Pagination } from "@/components/dashboard/Pagination";

export const metadata = {
  title: "My Products",
  description: "Manage your product listings.",
};

interface PageProps {
  searchParams: Promise<{ search?: string; page?: string }>;
}

export default async function SellerProductsPage({ searchParams }: PageProps) {
  const { search, page: pageParam } = await searchParams;
  const page = Number(pageParam) > 0 ? Number(pageParam) : 1;

  const { items: products, pagination } = await getMyListings({ search, page });

  return (
    <div>
      <PageHeader
        title="My Products"
        subtitle="View, edit, or remove your own listings."
        createHref="/seller/products/new"
        createLabel="New listing"
      />

      {/* Search */}
      <form
        action="/seller/products"
        method="get"
        className="mb-6 flex gap-2 max-w-md"
      >
        <input
          type="search"
          name="search"
          defaultValue={search ?? ""}
          placeholder="Search your listings"
          className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700 rounded-lg hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors duration-150"
        >
          Search
        </button>
      </form>

      <ProductsTable products={products} basePath="/seller/products" />

      <Pagination
        page={pagination.page}
        perPage={pagination.per_page}
        total={pagination.total}
        basePath="/seller/products"
        query={{ search }}
      />
    </div>
  );
}
