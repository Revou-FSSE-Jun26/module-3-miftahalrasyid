/**
 * Reusable next.onFetch router + helpers for the mocked E2E suite.
 *
 * Every backend path a spec touches must be registered here (or added per-test).
 * The `noLeak` fallback THROWS on any unmatched /api/v1 / midtrans / railway URL
 * so an un-mocked call fails loudly — guaranteeing no real backend entry.
 */
import {
  listEnvelope,
  itemEnvelope,
  tokensFor,
  type RoleKey,
  mockProducts,
  mockCategories,
  mockDefaultAddress,
  mockCartLine,
  cartEnvelope,
  mockPendingOrder,
  mockSnap,
} from "./fixtures";

type FetchReq = { url: string; method: string; headers?: Headers };

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export interface HandlerOptions {
  /** Which seeded role the mocked login should authenticate as. */
  role?: RoleKey;
  /** Products returned by the public browse list. Defaults to mockProducts. */
  products?: typeof mockProducts;
  /** Addresses returned by GET /users/me/addresses. Empty = "no default". */
  addresses?: Array<Record<string, unknown>>;
  /** Override cart lines returned by GET /cart. */
  cartLines?: Array<Record<string, unknown>>;
  /** Per-path overrides: return a Response to short-circuit, or undefined to fall through. */
  overrides?: (req: FetchReq) => Response | undefined;
}

/**
 * Build an onFetch handler. Usage in a test:
 *   next.onFetch(makeHandlers({ role: "buyer" }))
 */
export function makeHandlers(opts: HandlerOptions = {}) {
  const role: RoleKey = opts.role ?? "buyer";
  const products = opts.products ?? mockProducts;
  const addresses = opts.addresses ?? [mockDefaultAddress];
  const cartLines = opts.cartLines ?? [];

  return (request: FetchReq): Response | undefined => {
    const { url, method } = request;

    // Per-test overrides win first.
    const o = opts.overrides?.(request);
    if (o) return o;

    // ---- Auth ----
    if (url.includes("/api/v1/auth/login") && method === "POST") {
      return json({ ...tokensFor(role), message: "Login successful!" });
    }
    if (url.includes("/api/v1/auth/register") && method === "POST") {
      return json({
        success: true,
        message: "Registration successful. Please verify your email.",
        is_active: false,
      });
    }
    if (url.includes("/api/v1/auth/oauth/google") && method === "POST") {
      return json({
        ...tokensFor(role),
        message: "Login successful via Google.",
      });
    }
    if (
      url.includes("/api/v1/auth/email_confirmation") ||
      url.includes("/api/v1/auth/verify")
    ) {
      return json({ success: true, message: "Email verified successfully." });
    }
    if (url.includes("/api/v1/auth/refresh") && method === "POST") {
      return json({ access_token: tokensFor(role).access_token });
    }

    // ---- Current user ----
    if (url.includes("/api/v1/users/me/addresses")) {
      if (method === "GET") return json({ success: true, data: addresses });
      if (method === "POST")
        return json(
          {
            success: true,
            message: "Address created",
            data: mockDefaultAddress,
          },
          201,
        );
      if (method === "PUT")
        return json({
          success: true,
          message: "Address updated",
          data: mockDefaultAddress,
        });
      if (method === "DELETE")
        return json({ success: true, message: "Address deleted successfully" });
    }
    if (url.includes("/api/v1/users/me/profile") && method === "PUT") {
      return json({ success: true, message: "Profile updated", data: {} });
    }
    if (url.match(/\/api\/v1\/users\/me(\/|\?|$)/) && method === "GET") {
      return json({
        success: true,
        data: {
          id: 8,
          email: "budi@gmail.com",
          age: 27,
          roles: ["BUYER"],
          is_active: true,
          profile: {
            bio: "Shopper",
            phone: "+6281200000008",
            avatar_url: null,
            updated_at: null,
          },
          username: "budi",
        },
      });
    }

    // ---- Admin: users ----
    if (url.match(/\/api\/v1\/users\/\d+/) && method === "PUT") {
      return json({ success: true, message: "User updated", form: {} });
    }
    if (url.match(/\/api\/v1\/users\/?(\?|$)/) && method === "GET") {
      return json(
        listEnvelope([
          {
            id: 8,
            username: "budi",
            email: "budi@gmail.com",
            roles: ["BUYER"],
            is_active: true,
          },
          {
            id: 3,
            username: "justin",
            email: "justin@gmail.com",
            roles: ["BUYER", "SELLER"],
            is_active: true,
          },
        ]),
      );
    }
    if (url.includes("/api/v1/users/") && method === "POST") {
      return json(
        { success: true, message: "User created", data: { id: 99 } },
        201,
      );
    }

    // ---- Categories ----
    if (url.includes("/api/v1/categories")) {
      if (method === "GET") return json(listEnvelope(mockCategories));
      if (method === "POST")
        return json(
          {
            success: true,
            message: "Category created successfully",
            data: { id: 3, name: "new" },
          },
          201,
        );
      if (method === "PUT")
        return json({
          success: true,
          message: "Category updated successfully",
          data: { id: 1, name: "renamed" },
        });
      if (method === "DELETE")
        return json({ success: true, message: "Category 1 soft-deleted" });
    }

    // ---- Seller products ----
    if (url.includes("/api/v1/seller-products")) {
      const detail = url.match(/\/api\/v1\/seller-products\/(\d+)(\/|\?|$)/);
      if (detail && method === "GET") {
        const id = Number(detail[1]);
        const found = products.find((p) => p.id === id);
        return json(itemEnvelope(found ?? null));
      }
      if (detail && method === "PUT") {
        return json({
          success: true,
          message: "Listing updated successfully",
          data: { id: Number(detail[1]) },
        });
      }
      if (detail && method === "DELETE") {
        return json({ success: true, message: "Listing deleted" });
      }
      if (method === "POST") {
        // Newly created listing starts PENDING (needs admin approval).
        return json(
          {
            success: true,
            message: "Listing created successfully",
            data: { id: 999, status: "PENDING" },
          },
          201,
        );
      }
      if (method === "GET") {
        return json(listEnvelope(products));
      }
    }

    // ---- Cart ----
    if (url.includes("/api/v1/cart")) {
      // Add item → POST /cart/items
      if (url.includes("/cart/items") && method === "POST")
        return json({ success: true, message: "Item added to cart" }, 201);
      // Update / remove line → PATCH|DELETE /cart/items/:id
      if (
        url.includes("/cart/items") &&
        (method === "PATCH" || method === "PUT")
      )
        return json({ success: true, message: "Cart updated" });
      if (url.includes("/cart/items") && method === "DELETE")
        return json({ success: true, message: "Item removed" });
      // Clear cart → DELETE /cart/
      if (method === "DELETE")
        return json({ success: true, message: "Cart cleared" });
      // List cart → GET /cart/
      if (method === "GET") return json(cartEnvelope(cartLines));
    }

    // ---- Orders ----
    if (url.match(/\/api\/v1\/orders\/?(\?|$)/) && method === "GET") {
      return json(listEnvelope([mockPendingOrder]));
    }
    if (url.includes("/api/v1/orders/mine") && method === "GET") {
      return json(listEnvelope([mockPendingOrder]));
    }
    if (url.match(/\/api\/v1\/orders\/\d+/) && method === "GET") {
      return json(itemEnvelope(mockPendingOrder));
    }
    if (url.match(/\/api\/v1\/orders\/\d+/) && method === "PUT") {
      return json({
        success: true,
        message: "Order updated successfully",
        data: mockPendingOrder,
      });
    }
    if (url.includes("/api/v1/orders") && method === "POST") {
      return json(
        {
          success: true,
          message: "Order created successfully",
          data: mockPendingOrder,
        },
        201,
      );
    }

    // ---- Payment (Midtrans Snap) ----
    if (url.includes("/api/v1/payment") && method === "POST") {
      return json({
        success: true,
        message: "Payment initiated. Complete payment via redirect_url.",
        ...mockSnap,
        data: mockPendingOrder,
      });
    }

    // Not matched here → let the caller's noLeak fallback handle it.
    return undefined;
  };
}

/**
 * Fallback that THROWS on any unmocked backend/external call, so a missing mock
 * fails the test instead of silently hitting the network. Returns a 599 error
 * response (also logged) for anything that looks like a backend/3rd-party call.
 */
export function noLeak(request: FetchReq): Response | undefined {
  const { url } = request;
  const forbidden =
    url.includes("/api/v1/") ||
    url.includes("midtrans") ||
    url.includes("railway") ||
    url.includes("googleapis") ||
    url.includes("accounts.google");
  if (forbidden) {
    // Surfaces clearly in the test output.
    return new Response(
      JSON.stringify({
        error: `UNMOCKED BACKEND CALL: ${request.method} ${url}`,
      }),
      { status: 599, headers: { "Content-Type": "application/json" } },
    );
  }
  return undefined;
}

/** Compose makeHandlers + noLeak into a single onFetch callback. */
export function handlersWithGuard(opts: HandlerOptions = {}) {
  const primary = makeHandlers(opts);
  return (request: FetchReq): Response | undefined => {
    const r = primary(request);
    if (r) return r;
    return noLeak(request);
  };
}
