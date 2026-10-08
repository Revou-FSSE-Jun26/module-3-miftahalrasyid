"use client";

import { useRouter } from "next/navigation";

type Area = "buyer" | "seller" | "admin";

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
      className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
