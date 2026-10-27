import { getCatalogProducts } from "@/app/actions/admin.actions";
import { CatalogTable } from "@/components/dashboard/CatalogTable";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { getSession } from "@/app/lib/sessions";
import { Pagination } from "@/components/dashboard/Pagination";

export const metadata = {
  title: "Catalog Products",
  description: "Manage the shared product catalog.",
};

interface PageProps {
  searchParams: Promise<{ search?: string; page?: string }>;
}

export default async function AdminCatalogPage({ searchParams }: PageProps) {
  const { search, page: pageParam } = await searchParams;
  const page = Number(pageParam) > 0 ? Number(pageParam) : 1;
  const [{ items: products, pagination }, session] = await Promise.all([
    getCatalogProducts({ search, page }),
    getSession(),
  ]);
  const canHardDelete = (session?.roles ?? []).includes("SUPERADMIN");

  return (
    <div>
      <PageHeader
        title="Catalog Products"
        subtitle="The shared product catalog (brand, name, specs). Includes soft-deleted rows."
        createHref="/admin/products/new"
        createLabel="New product"
      />
      <form
        action="/admin/products"
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
      <CatalogTable
        products={products}
        canHardDelete={canHardDelete}
        basePath="/admin/products"
      />
      <Pagination
        page={pagination.page}
        perPage={pagination.per_page}
        total={pagination.total}
        basePath="/admin/products"
        query={{ search }}
      />
    </div>
  );
}
