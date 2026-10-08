import { getCatalogProducts } from "@/app/actions/admin.actions";
import { CatalogTable } from "@/components/dashboard/CatalogTable";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { getSession } from "@/app/lib/sessions";

export const metadata = {
  title: "Catalog Products",
  description: "Manage the shared product catalog.",
};

interface PageProps {
  searchParams: Promise<{ search?: string }>;
}

export default async function AdminCatalogPage({ searchParams }: PageProps) {
  const { search } = await searchParams;
  const [products, session] = await Promise.all([
    getCatalogProducts(search),
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
      <CatalogTable
        products={products}
        canHardDelete={canHardDelete}
        basePath="/admin/products"
      />
    </div>
  );
}
