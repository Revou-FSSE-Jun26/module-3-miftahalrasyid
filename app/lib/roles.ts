/**
 * Centralized role logic — the single source of truth for "what can this set of
 * roles access". Both the proxy (middleware) and the server-side layout guards
 * use these so the rules can't drift apart.
 *
 * Rule summary (as requested):
 *   - A BUYER cannot access seller routes.
 *   - A BUYER who also has the SELLER role CAN access seller routes.
 *   - A SELLER cannot access admin routes.
 *   - ADMIN / SUPERADMIN can access everything below them.
 */
export type Role = "BUYER" | "SELLER" | "ADMIN" | "SUPERADMIN";

/** Can view the seller area: SELLER, or an admin/superadmin previewing it. */
export function canAccessSeller(roles: string[]): boolean {
  return (
    roles.includes("SELLER") ||
    roles.includes("ADMIN") ||
    roles.includes("SUPERADMIN")
  );
}

/** Can view the admin area: ADMIN or SUPERADMIN only (a plain SELLER cannot). */
export function canAccessAdmin(roles: string[]): boolean {
  return roles.includes("ADMIN") || roles.includes("SUPERADMIN");
}

/** Superadmin-only areas (e.g. hard deletes, user management). */
export function canAccessSuperadmin(roles: string[]): boolean {
  return roles.includes("SUPERADMIN");
}
