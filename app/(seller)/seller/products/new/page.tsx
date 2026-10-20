import { PageHeader } from "@/components/dashboard/PageHeader";
import { AddProductForm } from "@/components/dashboard/AddProductForm";
import { getCategoriesForSelect } from "@/app/actions/categories.actions";

export const metadata = { title: "New Listing" };

export default async function NewSellerProductPage() {
  const categories = await getCategoriesForSelect();

  return (
    <div>
      <PageHeader
        title="New Listing"
        subtitle="Create a listing. Add images after product creation."
        createHref="/seller/products"
        createLabel="Back to list"
      />
      <AddProductForm categories={categories} />
    </div>
  );
}
