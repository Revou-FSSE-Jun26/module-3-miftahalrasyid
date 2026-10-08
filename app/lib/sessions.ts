import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";
import { api } from "@/app/lib/api";
import { logger } from "@/utils/logger";
import {
  COOKIE_BASE,
  ACCESS_TOKEN_FALLBACK,
  REFRESH_TOKEN_FALLBACK,
  maxAgeFromToken,
} from "@/app/lib/sessionConfig";

/**
 * Store the access token cookie. maxAge matches the token's own expiry.
 */
export async function setAccessToken(accessToken: string) {
  const cookieStore = await cookies();
  cookieStore.set("access_token", accessToken, {
    ...COOKIE_BASE,
    maxAge: maxAgeFromToken(accessToken, ACCESS_TOKEN_FALLBACK),
  });
}

/**
 * Create a full session on login: both access + refresh token cookies.
 */
export async function createSession(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();

  cookieStore.set("access_token", accessToken, {
    ...COOKIE_BASE,
    maxAge: maxAgeFromToken(accessToken, ACCESS_TOKEN_FALLBACK),
  });

  cookieStore.set("refresh_token", refreshToken, {
    ...COOKIE_BASE,
    maxAge: maxAgeFromToken(refreshToken, REFRESH_TOKEN_FALLBACK),
  });
}

/**
 * Exchange the stored refresh token for a new access token.
 * The Flask refresh endpoint returns ONLY a new access_token — the refresh
 * token keeps its original 7-day lifetime, so we leave that cookie untouched.
 * Returns the new access token, or throws (and clears the session) on failure.
 */
export async function refreshSession() {
  const cookieStore = await cookies();
  const currentRefreshToken = cookieStore.get("refresh_token")?.value;

  if (!currentRefreshToken) throw new Error("No refresh token available");

  try {
    const response = await api.post("/api/v1/auth/refresh", {}, {
      headers: { Authorization: `Bearer ${currentRefreshToken}` },
      // mark so the response interceptor never tries to refresh a refresh call
      _skipAuthRefresh: true,
    } as never);

    const { access_token } = response.data;
    if (!access_token) throw new Error("Refresh response missing access_token");

    await setAccessToken(access_token);
    return access_token as string;
  } catch (err) {
    logger.error("Refresh token failed, clearing session: " + err);
    await deleteSession();
    throw err;
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
}

export interface Session {
  isAuthenticated: true;
  userId: string | null;
  email: string | null;
  roles: string[];
}

/** Decode the useful claims from an access-token JWT. */
function decodeSession(accessToken: string): Session {
  try {
    const claims = jwtDecode<{
      sub?: string;
      email?: string;
      roles?: string[];
    }>(accessToken);
    return {
      isAuthenticated: true,
      userId: claims.sub ?? null,
      email: claims.email ?? null,
      roles: claims.roles ?? [],
    };
  } catch {
    return { isAuthenticated: true, userId: null, email: null, roles: [] };
  }
}

/**
 * Return the current session (with roles decoded from the JWT), refreshing the
 * access token when it has expired but a valid refresh token is still present.
 * Returns null only when the user is genuinely logged out.
 */
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (accessToken) {
    return decodeSession(accessToken);
  }

  // Access token gone/expired — try the 7-day refresh token before giving up.
  const refreshToken = cookieStore.get("refresh_token")?.value;
  if (!refreshToken) return null;

  try {
    const newAccessToken = await refreshSession();
    return decodeSession(newAccessToken);
  } catch {
    return null;
  }
}

/**
 * Read the current access token (used by the request interceptor to attach
 * the Authorization header on server-side calls).
 */
export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("access_token")?.value ?? null;
}
