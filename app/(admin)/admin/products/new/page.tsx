import { PageHeader } from "@/components/dashboard/PageHeader";

export const metadata = { title: "New Catalog Product" };

export default function NewCatalogProductPage() {
  return (
    <div>
      <PageHeader
        title="New Catalog Product"
        subtitle="Add a new product to the shared catalog."
        createHref="/admin/products"
        createLabel="Back to list"
      />
      <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-xl py-16 text-center text-gray-500">
        Create catalog product form — coming soon.
      </div>
    </div>
  );
}
