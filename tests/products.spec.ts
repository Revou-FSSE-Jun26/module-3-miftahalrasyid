import { test, expect, devices } from "next/experimental/testmode/playwright";
// import { test, expect } from "@playwright/test";
import { SellerProduct } from "@/app/actions/catalog.actions";
import { CreateListingInput } from "@/app/actions/seller.actions";
import { logger } from "@/utils/logger";
// WRITE YOUR API-MOCKING TEST HERE — this is real Playwright code.
const mockProducts = [
  {
    id: 1,
    product_id: 1,
    title: "Laptop",
    price: 5000000,
    seller_id: 3,
    slug: "Laptop",
    stock: 20,
    status: "ACTIVE",
    images: [""],
  },
  {
    id: 2,
    product_id: 2,
    title: "Mouse",
    price: 35000,
    seller_id: 3,
    slug: "Mouse",
    stock: 20,
    status: "ACTIVE",
    images: [""],
  },
] as SellerProduct[];
test("products page renders the mocked products", async ({ page, next }) => {
  // TODO 1: intercept GET /api/products and fulfill it with a mocked
  //         list of TWO products BEFORE navigating:
  next.onFetch((request) => {
    if (request.url.includes("/api/v1/seller-products")) {
      // 🌟 1. Remove the rigid '$' anchor so it matches even if there are query parameters at the end
      const match = request.url.match(
        /\/api\/v1\/seller-products\/slug\/([^/?#]+)/,
      );
      // const match = request.url.match(detailRouteRegex);

      logger.info(match, "get product id");

      if (match && request.method === "GET") {
        const productSlug = match[1];
        // Cari produk berdasarkan properti slug-nya
        const specificProduct = mockProducts.find(
          (p) => p.slug === productSlug,
        );

        return new Response(
          JSON.stringify({
            data: specificProduct || null, // Return null cleanly if the ID isn't found
          }),
          { headers: { "Content-Type": "application/json" } },
        );
      }

      if (request.method === "GET" && !match) {
        return new Response(
          JSON.stringify({
            data: mockProducts,
          }),
          { headers: { "Content-Type": "application/json" } },
        );
      }
    }
  });

  await page.goto("/products");

  // TODO 2: assert product-1 is visible and has text 'Laptop',
  //         and that product-2 is visible.
  const card = page.getByTestId("product-1");
  //   await card.waitFor({ state: "visible", timeout: 5000 });
  await expect(card).toBeVisible();

  // --- open the product detail page ---
  // TODO 1: click add-product-button, fill name-input "Mouse" and
  //         price-input "99000", click save-product
  await card.click();
  await page.waitForURL("**/products/Laptop");
  const cartButtons = page.getByTestId("product-details_add-to-cart_full-1");

  // 2. Pastikan total elemen dengan Test ID tersebut di dalam HTML (DOM) ada TEPAT 2
  await expect(cartButtons).toHaveCount(2);

  // 3. Pastikan MINIMAL ada 1 elemen yang berstatus terlihat/aktif di layar pengguna
  await expect(cartButtons.filter({ visible: true }).first()).toBeVisible();

  // --- add it to the cart ---
  // TODO 2: assert toast-success is visible AND product-row-7 is visible
  //         and contains "Mouse"

  // --- UPDATE ---
  // TODO 3: click edit-product-7, fill price-input "79000", click save-product
  // TODO 4: assert product-row-7 now contains "Rp 79.000"

  // --- DELETE ---
  // TODO 5: register page.on('dialog', d => d.accept()), click delete-product-7
  // TODO 6: assert product-row-7 is hidden
});

// ---------------------------------------------------------------------------
// ADDITIVE TESTS (added by tooling) — the test above is left intact.
// These reuse the shared mocked handlers so no backend is contacted.
// ---------------------------------------------------------------------------
import { handlersWithGuard } from "./support/handlers";
import { settle } from "./support/session";

test("products list shows both mocked products", async ({ page, next }) => {
  next.onFetch(handlersWithGuard({ role: "buyer" }));
  await page.goto("/products");
  //   await page.waitForLoadState("networkidle");
  await page.waitForSelector("h1");
  await settle(page);
  await expect(page.getByTestId("product-1")).toBeVisible();
  await expect(page.getByTestId("product-2")).toBeVisible();
});

test("product detail renders the full add-to-cart button", async ({
  page,
  next,
}) => {
  next.onFetch(handlersWithGuard({ role: "buyer" }));
  await page.goto("/products/mouse");
  //   await page.waitForLoadState("networkidle");
  await page.waitForSelector("h1");
  await settle(page);
  const cartButtons = page.getByTestId("product-details_add-to-cart_full-2");

  // 2. Pastikan total elemen dengan Test ID tersebut di dalam HTML (DOM) ada TEPAT 2
  await expect(cartButtons).toHaveCount(2);

  // 3. Pastikan MINIMAL ada 1 elemen yang berstatus terlihat/aktif di layar pengguna
  await expect(cartButtons.filter({ visible: true }).first()).toBeVisible();
});

test("unknown product id renders not-found (no backend leak)", async ({
  page,
  next,
}) => {
  next.onFetch(handlersWithGuard({ role: "buyer" }));
  await page.goto("/products/123456");
  await settle(page);
  // Detail action button for a non-existent product must not be present.
  await expect(
    page.getByTestId("product-details_add-to-cart_full-123456"),
  ).toHaveCount(0);
});

const viewports = [
  { name: "Desktop (1280x800)", width: 1280, height: 800 },
  { name: "Tablet Portrait (768x1024)", width: 768, height: 1024 },
  { name: "Mobile Portrait (375x667)", width: 375, height: 667 },
];

test.describe("Add to Cart Button Display UI", () => {
  // Test across raw viewport dimensions
  for (const vp of viewports) {
    test(`should display exactly one Add to Cart button on ${vp.name}`, async ({
      page,
      next,
    }) => {
      next.onFetch(handlersWithGuard({ role: "buyer" }));
      // Set the viewport size dynamically
      await page.setViewportSize({ width: vp.width, height: vp.height });

      // Navigate to your product page (replace with your route)
      await page.goto("/products/mouse");

      // Locate all elements matching your Add to Cart button
      // Tip: Use a robust locator like getByRole or a specific data-testid
      const addToCartButtons = page.getByRole("button", {
        name: /add to cart/i,
      });

      // CRITICAL ASSERTION: Assert that exactly 1 button is physically visible to the user
      await expect(addToCartButtons.filter({ visible: true })).toHaveCount(1);
    });
  }

  // 2. Alternatively, test using Playwright's built-in device emulators
  test("should display exactly one Add to Cart button on simulated iPhone 14", async ({
    page,
    next,
  }) => {
    next.onFetch(handlersWithGuard({ role: "buyer" }));
    // Emulate iPhone 14 dimensions and user agent directly in the test if needed
    await page.setViewportSize(devices["iPhone 14"].viewport);

    await page.goto("/products/laptop");

    const visibleButtons = page
      .getByRole("button", { name: /add to cart/i })
      .filter({ visible: true });
    await expect(visibleButtons).toHaveCount(1);
  });
});
