import { getMyListings } from "@/app/actions/seller.actions";
import { ProductsTable } from "@/components/dashboard/ProductsTable";
import { PageHeader } from "@/components/dashboard/PageHeader";

export const metadata = {
  title: "Seller Products",
  description: "Manage every seller listing on the platform.",
};

interface PageProps {
  searchParams: Promise<{ search?: string }>;
}

export default async function AdminSellerProductsPage({ searchParams }: PageProps) {
  const { search } = await searchParams;
  // /seller-products/mine returns ALL listings (all statuses) for admin.
  const products = await getMyListings(search);

  return (
    <div>
      <PageHeader
        title="Seller Products"
        subtitle="Every listing across all sellers, all statuses."
        createHref="/admin/seller-products/new"
        createLabel="New listing"
      />
      <ProductsTable products={products} isAdmin basePath="/admin/seller-products" />
    </div>
  );
}
