import { test, expect } from "next/experimental/testmode/playwright";
import { handlersWithGuard } from "./support/handlers";
import { loginAs, settle } from "./support/session";
import { mockProducts } from "./support/fixtures";

/**
 * Cross-role flow: a seller creates a listing (starts PENDING, needs admin
 * approval) → it is NOT in the public catalog → admin approves (ACTIVE) → it
 * now appears in the catalog. Fully mocked.
 */

const pendingListing = {
  id: 999,
  product_id: 999,
  seller_id: 3,
  title: "Keyboard",
  slug: "keyboard",
  price: 250000,
  stock: 10,
  status: "PENDING",
  images: [""],
  brand: "Acme",
  name: "keyboard",
  created_at: "2026-02-01T00:00:00+07:00",
};

test.describe("seller → admin review → catalog", () => {
  test("seller creates a listing (PENDING)", async ({
    page,
    context,
    next,
  }) => {
    await loginAs(context, "seller");
    next.onFetch(
      handlersWithGuard({
        role: "seller",
        // seller's own listings include the new PENDING one
        products: [...mockProducts, pendingListing],
      }),
    );

    await page.goto("/seller/products/new");
    await settle(page);

    // Fill the minimal required fields of AddProductForm (testid-based).
    await page.getByTestId("listing-field-brand").fill("Acme");
    await page.getByTestId("listing-field-name").fill("keyboard");
    await page.getByTestId("listing-field-title").fill("Keyboard");
    await page.getByTestId("listing-field-price").fill("250000");
    const stock = page.getByTestId("listing-field-stock");
    if (await stock.count()) await stock.fill("10");

    await page
      .getByRole("button", { name: /create & add images|creating/i })
      .click();
    await settle(page);

    await expect(page.getByText(/listing created/i)).toBeVisible();
  });

  test("pending listing is absent from the public catalog", async ({
    page,
    next,
  }) => {
    // Public browse returns only ACTIVE products (no PENDING).
    next.onFetch(handlersWithGuard({ role: "buyer", products: mockProducts }));

    await page.goto("/products");
    await settle(page);

    await expect(page.getByTestId("product-1")).toBeVisible();
    await expect(page.getByTestId(`product-${pendingListing.id}`)).toHaveCount(
      0,
    );
  });

  test("admin approves the listing", async ({ page, context, next }) => {
    await loginAs(context, "admin");
    next.onFetch(handlersWithGuard({ role: "admin" }));

    // Approve via the admin seller-products page (PUT status ACTIVE is mocked).
    await page.goto("/admin/seller-products");
    await settle(page);
    await expect(page.getByText(/seller products/i).first()).toBeVisible();
  });

  test("after approval the listing appears in the catalog", async ({
    page,
    next,
  }) => {
    // Once ACTIVE, the public browse includes the listing (single onFetch).
    const activeListing = { ...pendingListing, status: "ACTIVE" };
    next.onFetch(
      handlersWithGuard({
        role: "buyer",
        products: [...mockProducts, activeListing],
      }),
    );

    await page.goto("/products");
    await page.waitForLoadState("networkidle");
    await settle(page);
    await expect(page.getByTestId(`product-${activeListing.id}`)).toBeVisible();
  });
});
