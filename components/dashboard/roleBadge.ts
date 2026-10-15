import type { Role } from "@/app/actions/admin-users.actions";

/**
 * Tailwind classes for a role badge. Plain module (no "use client") so both the
 * server users page and the client row-actions can import it.
 */
export function roleBadge(role: Role): string {
  switch (role) {
    case "SUPERADMIN":
      return "bg-purple-100 text-purple-700";
    case "ADMIN":
      return "bg-indigo-100 text-indigo-700";
    case "SELLER":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-gray-100 text-gray-600"; // BUYER
  }
}
