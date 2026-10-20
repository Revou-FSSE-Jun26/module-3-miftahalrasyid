"use client";

import { useRouter } from "next/navigation";

export type Area = "buyer" | "seller" | "admin";

interface RoleSwitcherProps {
  roles: string[];
  /** Which shell this switcher is rendered in (the current, selected value). */
  currentArea: Area;
}

const ROUTE: Record<Area, string> = {
  buyer: "/",
  seller: "/seller/products",
  admin: "/admin/products",
};

/**
 * Role/view switcher as a native <select>. Shows every mode at or below the
 * user's rank; changing it navigates to that area (each area is its own route
 * group, so the layout swaps). Label-only: a superadmin's top option reads
 * "Superadmin" but routes to the shared /admin dashboard.
 */
export function RoleSwitcher({ roles, currentArea }: RoleSwitcherProps) {
  const router = useRouter();

  const isSuperadmin = roles.includes("SUPERADMIN");
  const isAdmin = roles.includes("ADMIN") || isSuperadmin;
  const isSeller = roles.includes("SELLER") || isAdmin;

  // Build options from highest rank down. The top option is labelled with the
  // user's actual top role; it still maps to the `admin` area route.
  const options: { value: Area; label: string }[] = [];
  if (isAdmin) {
    options.push({ value: "admin", label: isSuperadmin ? "Superadmin" : "Admin" });
  }
  if (isSeller) options.push({ value: "seller", label: "Seller" });
  options.push({ value: "buyer", label: "Buyer" });

  // Nothing to switch to (plain buyer) — hide the control.
  if (options.length <= 1) return null;

  return (
    <select
      aria-label="Switch view"
      value={currentArea}
      onChange={(e) => router.push(ROUTE[e.target.value as Area])}
      className="w-full pl-3 pr-9 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20width%3D%2224%22%20height%3D%2224%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22/%3E%3C/svg%3E')] bg-no-repeat bg-[position:right_12px_center] bg-[size:16px]"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
