import { getMyListingById } from "@/app/actions/seller.actions";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ImageUploader } from "@/components/dashboard/ImageUploader";
import { ListingEditForm } from "@/components/dashboard/ListingEditForm";
import { formatTitle } from "@/utils/format";
import { notFound } from "next/navigation";

export const metadata = { title: "Edit Listing" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSellerProductPage({ params }: PageProps) {
  const { id } = await params;
  const listing = await getMyListingById(id);

  if (!listing) {
    notFound();
  }

  return (
    <div className="space-y-10">
      <PageHeader
        title={`Edit · ${formatTitle(listing.title || listing.name)}`}
        subtitle="Update listing details and manage images."
        createHref="/seller/products"
        createLabel="Back to list"
      />

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
          Details
        </h2>
        <ListingEditForm listing={listing} />
      </section>

      <section>
        <ImageUploader listingId={Number(id)} images={listing.images || []} />
      </section>
    </div>
  );
}
