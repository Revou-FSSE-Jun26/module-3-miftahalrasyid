import { PageHeader } from "@/components/dashboard/PageHeader";

export const metadata = { title: "New Seller Listing" };

export default function NewAdminSellerProductPage() {
  return (
    <div>
      <PageHeader
        title="New Seller Listing"
        subtitle="Create a listing on behalf of a seller."
        createHref="/admin/seller-products"
        createLabel="Back to list"
      />
      <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-xl py-16 text-center text-gray-500">
        Create listing form — coming soon.
      </div>
    </div>
  );
}
