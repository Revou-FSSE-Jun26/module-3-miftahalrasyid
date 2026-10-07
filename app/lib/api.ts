import axios, { AxiosRequestConfig } from "axios";

// Get the Flask API URL from environment variables, fallback to local Flask port
const FLASK_API_URL =
  process.env.NEXT_PUBLIC_FLASK_API_URL || "http://127.0.0.1:5000";

export const api = axios.create({
  baseURL: FLASK_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Config flag we add to requests that must NOT trigger the refresh-retry loop
// (the refresh call itself, and already-retried requests).
interface AuthConfig extends AxiosRequestConfig {
  _retry?: boolean;
  _skipAuthRefresh?: boolean;
}

const isServer = typeof window === "undefined";

/**
 * Request interceptor (server-side): attach the access token from the httpOnly
 * cookie as a Bearer header. Client-side requests are left untouched — the
 * browser can't read httpOnly cookies anyway, and authed calls go through
 * server actions / Server Components.
 */
api.interceptors.request.use(async (config) => {
  const cfg = config as AuthConfig;

  // Don't overwrite an explicitly-set Authorization header (e.g. the refresh
  // call passes the refresh token directly).
  if (isServer && !cfg._skipAuthRefresh && !config.headers?.Authorization) {
    // Lazy import to avoid a circular dependency with sessions.ts.
    const { getAccessToken } = await import("@/app/lib/sessions");
    const token = await getAccessToken();
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as Record<string, string>).Authorization =
        `Bearer ${token}`;
    }
  }

  return config;
});

/**
 * Response interceptor: on a 401, try refreshing the access token once, then
 * retry the original request. Works on both server and client, but the cookie
 * writes only succeed within a Server Action / Route Handler / Server Component
 * request lifecycle (which is where our authed calls run).
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AuthConfig | undefined;

    const status = error.response?.status;
    const shouldAttemptRefresh =
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest._skipAuthRefresh;

    if (shouldAttemptRefresh && originalRequest) {
      originalRequest._retry = true;

      if (isServer) {
        try {
          const { refreshSession } = await import("@/app/lib/sessions");
          const newAccessToken = await refreshSession();

          originalRequest.headers = originalRequest.headers ?? {};
          (originalRequest.headers as Record<string, string>).Authorization =
            `Bearer ${newAccessToken}`;

          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed (expired/invalid refresh token) — session already
          // cleared inside refreshSession(). Let the caller handle the 401.
          return Promise.reject(refreshError);
        }
      }

      // Client-side fallback: bounce to login preserving the current path.
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname + window.location.search;
        window.location.href = `/auth/login?next=${encodeURIComponent(
          currentPath,
        )}&message=session_expired`;
      }
    }

    return Promise.reject(error);
  },
);
