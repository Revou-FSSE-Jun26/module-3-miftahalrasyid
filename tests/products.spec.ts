import { test, expect } from "next/experimental/testmode/playwright";
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
      const detailRouteRegex = /\/api\/v1\/seller-products\/(\d+)(\/|\?|$)/;
      const match = request.url.match(detailRouteRegex);

      logger.info(match, "get product id");

      if (match && request.method === "GET") {
        const productId = parseInt(match[1], 10);

        // 🌟 2. Detail endpoints expect a SINGLE object { data: { ... } }, NOT a filtered array [{...}]
        const specificProduct = mockProducts.find(
          (product) => product.id === productId,
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
  await page.waitForURL("**/products/1");
  const addtocart = page.getByTestId("product-details_add-to-cart_full-1");
  await expect(addtocart).toBeVisible();

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
  await page.goto("/products/2");
  //   await page.waitForLoadState("networkidle");
  await page.waitForSelector("h1");
  await settle(page);
  await expect(
    page.getByTestId("product-details_add-to-cart_full-2"),
  ).toBeVisible();
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
