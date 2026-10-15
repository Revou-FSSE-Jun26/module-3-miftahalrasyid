import { getAdminCategories } from "@/app/actions/admin-categories.actions";
import { CategoryClient } from "@/components/dashboard/CategoryClient";
import { Pagination } from "@/components/dashboard/Pagination";

export const metadata = {
  title: "Categories",
  description: "Create, rename and remove product categories.",
};

interface PageProps {
  searchParams: Promise<{ page?: string; per_page?: string; search?: string }>;
}

export default async function AdminCategoriesPage({ searchParams }: PageProps) {
  const { page: pageParam, per_page: per_pageParam, search } = await searchParams;
  const page = Number(pageParam) > 0 ? Number(pageParam) : 1;
  const per_page = Number(per_pageParam) > 0 ? Number(per_pageParam) : 10;

  const { items, pagination } = await getAdminCategories({ page, per_page, search });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Categories
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Create, rename or remove the categories products are filed under.
        </p>
      </div>

      {/* Search */}
      <form
        action="/admin/categories"
        method="get"
        className="mb-6 flex gap-2 max-w-md"
      >
        <input
          type="search"
          name="search"
          defaultValue={search ?? ""}
          placeholder="Search categories"
          className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700 rounded-lg hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors duration-150"
        >
          Search
        </button>
      </form>

      <CategoryClient categories={items} />

      <Pagination
        page={pagination.page}
        perPage={pagination.per_page}
        total={pagination.total}
        basePath="/admin/categories"
        query={{ search }}
      />
    </div>
  );
}
