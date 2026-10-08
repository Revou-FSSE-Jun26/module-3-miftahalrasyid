import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { api } from "@/app/lib/api";
import {
  COOKIE_BASE,
  ACCESS_TOKEN_FALLBACK,
  maxAgeFromToken,
} from "@/app/lib/sessionConfig";

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
    const refreshRes = await api.post(
      "/api/v1/auth/refresh",
      {},
      {
        headers: { Authorization: `Bearer ${refreshToken}` },
        // never let the response interceptor try to refresh a refresh call
        _skipAuthRefresh: true,
      } as never,
    );

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

  return response;
}

export const config = {
  // Run on app routes, but skip Next internals, API passthroughs, and static
  // assets so we don't block CSS/JS/images or waste refresh calls.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|static|.*\\..*).*)",
  ],
};
