import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { SidebarNav } from "@/components/dashboard/SidebarNav";
import { getSession } from "@/app/lib/sessions";

const ADMIN_LINKS = [
  { label: "Products", href: "/admin/products" },
  { label: "Seller Products", href: "/admin/seller-products" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const roles = session?.roles ?? [];

  return (
    <DashboardShell
      navbar={<DashboardNavbar label="Admin" roles={roles} currentArea="admin" />}
      sidebar={<SidebarNav title="Admin" links={ADMIN_LINKS} />}
    >
      {children}
    </DashboardShell>
  );
}
