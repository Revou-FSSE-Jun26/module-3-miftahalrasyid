/**
 * Public read-only data layer (native fetch).
 *
 * Used for UNauthenticated GET calls (storefront browse, categories, product
 * detail for guests). Authenticated calls still go through the axios `api`
 * instance in app/lib/api.ts, which attaches the Bearer token and handles
 * refresh. This hybrid split keeps public reads simple + cacheable while
 * authed calls keep their session logic.
 *
 * Reads NEXT_PUBLIC_API_BASE_URL,
 * (the pre-existing var) so nothing breaks if only one is set.
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

/** Thrown when a public fetch returns a non-2xx response. */
export class ApiError extends Error {
  readonly status: number;
  readonly url: string;

  constructor(message: string, status: number, url: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.url = url;
  }
}

type QueryValue = string | number | boolean | undefined | null;

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const base = API_BASE_URL.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${base}${cleanPath}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

/**
 * GET a public JSON resource with native fetch.
 * Throws a typed `ApiError` on a non-ok response (res.ok check).
 *
 * @param path   API path, e.g. "/api/v1/seller-products".
 * @param query  optional query params (undefined/null/"" are skipped).
 * @param init   extra fetch options (e.g. { next: { revalidate: 60 } }).
 */
export async function publicGet<T>(
  path: string,
  query?: Record<string, QueryValue>,
  init?: RequestInit & { next?: { revalidate?: number; tags?: string[] } },
): Promise<T> {
  const url = buildUrl(path, query);

  const res = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    // Default to no-store so guest storefront data is always fresh; callers
    // can override via init.next for ISR-style caching.
    cache: "no-store",
    ...init,
  });

  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      detail = body?.message ? `: ${body.message}` : "";
    } catch {
      // non-JSON error body — ignore
    }
    throw new ApiError(
      `Request to ${path} failed with ${res.status}${detail}`,
      res.status,
      url,
    );
  }

  return (await res.json()) as T;
}
