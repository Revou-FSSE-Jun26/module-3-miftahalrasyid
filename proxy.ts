import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";
import { api } from "@/app/lib/api";
import {
  COOKIE_BASE,
  ACCESS_TOKEN_FALLBACK,
  maxAgeFromToken,
} from "@/app/lib/sessionConfig";

function rolesFromToken(token: string | undefined): string[] {
  if (!token) return [];
  try {
    return jwtDecode<{ roles?: string[] }>(token).roles ?? [];
  } catch {
    return [];
  }
}

/**
 * Proxy (formerly middleware) — runs before every matched request.
 *
 * Re-login feature: when the short-lived `access_token` cookie is gone/expired
 * but the 7-day `refresh_token` is still valid, we mint a fresh access token
 * via the Flask refresh endpoint and set it on the OUTGOING response. This is
 * the one place in Next where cookie writes always persist (unlike a Server
 * Component render), so it keeps the user logged in across the full refresh
 * window instead of logging out after ~1 hour.
 *
 * Reuses:
 *   - app/lib/api.ts         → axios instance for the HTTP refresh call
 *   - app/lib/sessionConfig  → shared cookie settings + maxAge helper
 */
export async function proxy(request: NextRequest) {
  const response = NextResponse.next();

  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  // Nothing to do if the access token is still present, or there's no refresh
  // token to fall back on.
  if (accessToken || !refreshToken) {
    return response;
  }

  try {
    const refreshRes = await api.post("/api/v1/auth/refresh", {}, {
      headers: { Authorization: `Bearer ${refreshToken}` },
      // never let the response interceptor try to refresh a refresh call
      _skipAuthRefresh: true,
    } as never);

    const newAccessToken: string | undefined = refreshRes.data?.access_token;
    if (newAccessToken) {
      // Persist the new access token on the response so the subsequent render
      // (and every later request) sees a valid session.
      response.cookies.set("access_token", newAccessToken, {
        ...COOKIE_BASE,
        maxAge: maxAgeFromToken(newAccessToken, ACCESS_TOKEN_FALLBACK),
      });

      // Also surface it to this request so Server Components in this pass can
      // read it immediately.
      request.cookies.set("access_token", newAccessToken);
    }
  } catch {
    // Refresh failed (expired/invalid refresh token). Clear the stale refresh
    // cookie so the app treats the user as logged out cleanly.
    response.cookies.delete("refresh_token");
  }

  // --- Role-based route guard --------------------------------------------
  // Use the freshest token available (just-refreshed one wins).
  const effectiveToken =
    request.cookies.get("access_token")?.value || accessToken;
  const roles = rolesFromToken(effectiveToken);
  const { pathname } = request.nextUrl;

  const isAuthenticated = !!effectiveToken;
  const isSeller =
    roles.includes("SELLER") ||
    roles.includes("ADMIN") ||
    roles.includes("SUPERADMIN");
  const isAdmin = roles.includes("ADMIN") || roles.includes("SUPERADMIN");

  // /cart and /orders → any authenticated user; guests go to login.
  if (
    (pathname.startsWith("/cart") || pathname.startsWith("/orders")) &&
    !isAuthenticated
  ) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }
  // /admin/* → ADMIN or SUPERADMIN only.
  if (pathname.startsWith("/admin") && !isAdmin) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  // /seller/* → SELLER (or admin/superadmin, who can preview seller view).
  if (pathname.startsWith("/seller") && !isSeller) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  // Run on app routes, but skip Next internals, API passthroughs, and static
  // assets so we don't block CSS/JS/images or waste refresh calls.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|static|.*\\..*).*)"],
};
