import { jwtDecode } from "jwt-decode";

/**
 * Pure session cookie config shared by sessions.ts (render/Server-Action scope)
 * and proxy.ts (request scope). No `next/headers` import here, so it's safe to
 * use from the proxy runtime.
 */
export const COOKIE_BASE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export const ACCESS_TOKEN_FALLBACK = 60 * 60; // 1 hour
export const REFRESH_TOKEN_FALLBACK = 60 * 60 * 24 * 7; // 7 days

/**
 * Remaining lifetime (in seconds) of a JWT from its `exp` claim.
 * Falls back to `fallbackSeconds` when the token can't be decoded.
 */
export function maxAgeFromToken(token: string, fallbackSeconds: number): number {
  try {
    const { exp } = jwtDecode<{ exp: number }>(token);
    const remaining = exp - Math.floor(Date.now() / 1000);
    return remaining > 0 ? remaining : fallbackSeconds;
  } catch {
    return fallbackSeconds;
  }
}
