import { getMyListings } from "@/app/actions/seller.actions";
import { ProductsTable } from "@/components/dashboard/ProductsTable";
import { PageHeader } from "@/components/dashboard/PageHeader";

export const metadata = {
  title: "My Products",
  description: "Manage your product listings.",
};

interface PageProps {
  searchParams: Promise<{ search?: string }>;
}

export default async function SellerProductsPage({ searchParams }: PageProps) {
  const { search } = await searchParams;
  const products = await getMyListings(search);

  return (
    <div>
      <PageHeader
        title="My Products"
        subtitle="View, edit, or remove your own listings."
        createHref="/seller/products/new"
        createLabel="New listing"
      />
      <ProductsTable products={products} basePath="/seller/products" />
    </div>
  );
}
