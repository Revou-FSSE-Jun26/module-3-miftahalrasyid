import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode"; // 👈 Tiny utility
import { api } from "@/app/lib/api";
import { logger } from "@/utils/logger";

export async function createSession(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();

  // 1. Decode the tokens to extract the Unix timestamp expiration ('exp')
  const decodedAccess = jwtDecode<{ exp: number }>(accessToken);
  const decodedRefresh = jwtDecode<{ exp: number }>(refreshToken);

  // 2. Convert Unix timestamp to remaining seconds (MaxAge expects seconds)
  const currentTimeInSeconds = Math.floor(Date.now() / 1000);

  const accessMaxAge = decodedAccess.exp - currentTimeInSeconds;
  const refreshMaxAge = decodedRefresh.exp - currentTimeInSeconds;

  // 3. Set the access token cookie matching Flask exactly
  cookieStore.set("access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: accessMaxAge, // 👈 Dynamically matched!
    path: "/",
  });

  // 4. Set the refresh token cookie matching Flask exactly
  cookieStore.set("refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: refreshMaxAge, // 👈 Dynamically matched!
    path: "/",
  });
}

export async function refreshSession() {
  const cookieStore = await cookies();
  const currentRefreshToken = cookieStore.get("refresh_token")?.value;

  if (!currentRefreshToken) throw new Error("No refresh token available");
  logger.debug("session is refreshed " + currentRefreshToken);
  try {
    // Call Flask refresh endpoint passing the old refresh token
    const response = await api.post(
      "/api/v1/auth/refresh",
      {},
      {
        headers: { Authorization: `Bearer ${currentRefreshToken}` },
      },
    );

    const { access_token, refresh_token } = response.data;
    await createSession(access_token, refresh_token);
    return access_token;
  } catch (err) {
    await deleteSession(); // Log them out if refresh token expired
    throw err;
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) return null;

  // Optional: Decode the token here if you want to return user details (like name)
  return { isAuthenticated: true };
}
