"use client"
import Link from "next/link";
import { logout } from "@/app/actions/auth.actions";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import { logout as logoutAction } from "@/app/actions/auth.actions"
import { useRouter } from "next/navigation";
import UserDropdown from "../UserDropdown";
type Area = "seller" | "admin";

/**
 * Top navbar for the seller/admin dashboard shells.
 * No cart (that lives in the buyer shell). The role <select> switches between
 * areas (and back to the shop); logout ends the session.
 */
export function DashboardNavbar({
  label,
  roles,
  email,
  currentArea,
}: {
  label: string;
  email?: string | null;
  roles: string[];
  currentArea: Area;
}) {
  const router = useRouter();
  const handleLogout = async () => {
    try {
      // 2. Call your Server Action to wipe backend cookies safely
      const result = await logoutAction();

      if (result?.success) {
        // 3. Force Next.js client cache to re-evaluate the current page layout tracks
        router.refresh();

        // 4. Navigate smoothly to the entry guest view landing page
        router.push('/');
      }
    } catch (error) {
      console.error("Proses pembersihan data logout bermasalah:", error);
    }
  };
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111] px-4 h-14">
      <div className="flex items-center gap-3">
        <Link href="/" className="text-lg font-bold tracking-tight text-gray-900 dark:text-gray-100">
          ⚡ Rovo<span className="text-indigo-600">Dev</span>Shop
        </Link>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
          {label}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <UserDropdown
          userEmail={email}
          currentArea={currentArea}
          roles={roles}
          types="spread"
          onLogout={handleLogout}
        />
        {/* <RoleSwitcher roles={roles} currentArea={currentArea} /> */}
        {/* <form action={logout}>
          <button
            type="submit"
            className="text-sm px-3 py-1.5 rounded-md text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            Logout
          </button>
        </form> */}
      </div>
    </header>
  );
}
