import { redirect } from "next/navigation";
import { getSession, type Session } from "@/app/lib/sessions";
import { canAccessSeller, canAccessAdmin, canAccessSuperadmin } from "@/app/lib/roles";

/**
 * Server-side route guards for use in Server Components / layouts. These are a
 * second line of defense behind the proxy (middleware): the proxy blocks
 * navigations early, these ensure a page never RENDERS for the wrong role even
 * if the proxy is somehow bypassed.
 *
 * Each guard returns the Session on success so the caller can reuse the roles
 * without decoding twice.
 */

/** Require any authenticated user. Guests → login (preserving where they went). */
export async function requireAuth(nextPath?: string): Promise<Session> {
  const session = await getSession();
  if (!session) {
    const next = nextPath ? `?next=${encodeURIComponent(nextPath)}` : "";
    redirect(`/auth/login${next}`);
  }
  return session;
}

/** Require seller access (SELLER or admin/superadmin). Others → home. */
export async function requireSeller(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/auth/login?next=/seller");
  if (!canAccessSeller(session.roles)) redirect("/");
  return session;
}

/** Require admin access (ADMIN or SUPERADMIN). A plain SELLER → home. */
export async function requireAdmin(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/auth/login?next=/admin");
  if (!canAccessAdmin(session.roles)) redirect("/");
  return session;
}

/** Require SUPERADMIN. Everyone else → home. */
export async function requireSuperadmin(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/auth/login");
  if (!canAccessSuperadmin(session.roles)) redirect("/");
  return session;
}
