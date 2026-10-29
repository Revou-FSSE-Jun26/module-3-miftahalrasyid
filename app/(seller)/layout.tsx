import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { SidebarNav } from "@/components/dashboard/SidebarNav";
import { requireSeller } from "@/app/lib/guards";
import Footer from "@/components/Footer";

const SELLER_LINKS = [
  { label: "Products", href: "/seller/products" },
  { label: "Incoming Orders", href: "/seller/orders" },
];

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Enforce seller access server-side (SELLER or admin/superadmin). A plain
  // buyer is redirected to home before this layout renders.
  const session = await requireSeller();
  const roles = session.roles;

  return (
    <DashboardShell
      navbar={<DashboardNavbar label="Seller" email={session?.email} roles={roles} currentArea="seller" />}
      sidebar={<SidebarNav title="Seller" links={SELLER_LINKS} />}
      footer={<Footer type="DASHBOARD" />}
    >
      {children}

    </DashboardShell>
  );
}
