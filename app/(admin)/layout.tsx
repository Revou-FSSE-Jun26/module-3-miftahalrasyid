import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { SidebarNav } from "@/components/dashboard/SidebarNav";
import { requireAdmin } from "@/app/lib/guards";

const ADMIN_LINKS = [
  { label: "Products", href: "/admin/products" },
  { label: "Seller Products", href: "/admin/seller-products" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Categories", href: "/admin/categories" },
  { label: "Users", href: "/admin/users" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Enforce admin access server-side (ADMIN or SUPERADMIN). A plain seller or
  // buyer is redirected to home before this layout renders.
  const session = await requireAdmin();
  const roles = session.roles;

  return (
    <DashboardShell
      navbar={<DashboardNavbar label="Admin" roles={roles} currentArea="admin" />}
      sidebar={<SidebarNav title="Admin" links={ADMIN_LINKS} />}
    >
      {children}
    </DashboardShell>
  );
}
