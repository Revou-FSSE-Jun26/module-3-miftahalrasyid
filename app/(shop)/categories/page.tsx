import { getCategories } from "@/app/actions/categories.actions";

export const metadata = {
  title: "Categories",
  description: "Browse product categories available on RovoDevShop.",
};

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-2">
        Categories
      </h1>
      <p className="text-gray-500 text-center mb-10">
        Explore products grouped by category
      </p>

      {categories.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-4">🗂️</div>
          <p className="text-gray-600 dark:text-gray-400">No categories found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {categories.map((category) => (
            <a
              key={category.name}
              href={`/products?category=${encodeURIComponent(category.name)}`}
              className="group bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl p-6 text-center hover:border-indigo-400 hover:shadow-md transition-all"
            >
              <div className="text-2xl mb-2">🏷️</div>
              <span className="font-medium text-gray-900 dark:text-gray-100 capitalize group-hover:text-indigo-600 transition-colors">
                {category.name}
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
