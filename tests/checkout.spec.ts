import { test, expect } from "next/experimental/testmode/playwright";
import { handlersWithGuard } from "./support/handlers";
import { loginAs, settle } from "./support/session";
import { mockCartLine, mockDefaultAddress, mockSnap } from "./support/fixtures";

/**
 * Buyer journey: products → detail → add to cart → cart → checkout.
 * Covers BOTH checkout branches: no default address (blocked + link) and the
 * happy path (order → payment → Midtrans redirect stub). Fully mocked.
 */

test.describe("checkout", () => {
  test("browse products and open a detail page", async ({ page, next }) => {
    next.onFetch(handlersWithGuard({ role: "buyer" }));

    await page.goto("/products");
    await page.waitForLoadState("networkidle");
    await settle(page);

    await expect(page.getByTestId("product-1")).toBeVisible();
    await expect(page.getByTestId("product-2")).toBeVisible();

    await page.getByTestId("product-1").click();
    await page.waitForURL("**/products/1");
    await settle(page);
    await expect(
      page.getByTestId("product-details_add-to-cart_full-1"),
    ).toBeVisible();
  });

  test("add to cart updates the header badge", async ({
    page,
    context,
    next,
  }) => {
    await loginAs(context, "buyer");
    // After add, the cart refresh should return the line.
    next.onFetch(
      handlersWithGuard({ role: "buyer", cartLines: [mockCartLine()] }),
    );

    await page.goto("/products/2");
    await settle(page);
    await page.getByTestId("product-details_add-to-cart_full-2").click();
    await settle(page);

    // Badge reflects distinct products (1).
    await expect(page.getByTestId("cart-button")).toContainText("1");
  });

  test("checkout is blocked when there is no default address", async ({
    page,
    context,
    next,
  }) => {
    await loginAs(context, "buyer");
    next.onFetch(
      handlersWithGuard({
        role: "buyer",
        cartLines: [mockCartLine()],
        addresses: [], // no address → no default
      }),
    );

    await page.goto("/cart");
    await settle(page);
    await page.getByRole("button", { name: /proceed to checkout/i }).click();
    await settle(page);

    await expect(
      page.getByText(/need a default shipping address/i),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /set up your address/i }),
    ).toHaveAttribute("href", "/my-account");
  });

  test("happy path: order then redirect to Midtrans stub", async ({
    page,
    context,
    next,
  }) => {
    await loginAs(context, "buyer");
    next.onFetch(
      handlersWithGuard({
        role: "buyer",
        cartLines: [mockCartLine()],
        addresses: [mockDefaultAddress],
      }),
    );

    // Intercept the Midtrans redirect target so no real Snap page loads.
    await page.route(mockSnap.redirect_url, (route) =>
      route.fulfill({
        status: 200,
        contentType: "text/html",
        body: "<h1>Midtrans stub</h1>",
      }),
    );

    await page.goto("/cart");
    await settle(page);
    await page.getByRole("button", { name: /proceed to checkout/i }).click();

    // App navigates to the mocked Snap redirect_url.
    await page.waitForURL(mockSnap.redirect_url);
    await settle(page);
    await expect(page.getByText(/midtrans stub/i)).toBeVisible();
  });
});
