import { requireSuperadmin } from "@/app/lib/guards";
import { NewAdminForm } from "@/components/dashboard/NewAdminForm";
import Link from "next/link";

export const metadata = {
  title: "New admin",
  description: "Create a new admin account.",
};

export default async function NewAdminPage() {
  // Superadmin only. A plain admin is redirected home before this renders.
  await requireSuperadmin();

  return (
    <div>
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 mb-6 transition-colors duration-150"
      >
        <span aria-hidden="true">←</span> Back to users
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          New admin
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Create a new account with the admin role.
        </p>
      </div>

      <NewAdminForm />
    </div>
  );
}
