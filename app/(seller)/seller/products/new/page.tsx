import { PageHeader } from "@/components/dashboard/PageHeader";

export const metadata = { title: "New Listing" };

export default function NewSellerProductPage() {
  return (
    <div>
      <PageHeader
        title="New Listing"
        subtitle="Create a new product listing."
        createHref="/seller/products"
        createLabel="Back to list"
      />
      <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-xl py-16 text-center text-gray-500">
        Create listing form — coming soon.
      </div>
    </div>
  );
}
