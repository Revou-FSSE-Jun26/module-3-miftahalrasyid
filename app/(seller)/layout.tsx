import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { SidebarNav } from "@/components/dashboard/SidebarNav";
import { getSession } from "@/app/lib/sessions";

const SELLER_LINKS = [{ label: "Products", href: "/seller/products" }];

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const roles = session?.roles ?? [];

  return (
    <DashboardShell
      navbar={<DashboardNavbar label="Seller" roles={roles} currentArea="seller" />}
      sidebar={<SidebarNav title="Seller" links={SELLER_LINKS} />}
    >
      {children}
    </DashboardShell>
  );
}
