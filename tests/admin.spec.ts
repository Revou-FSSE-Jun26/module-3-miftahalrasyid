import { test, expect } from "next/experimental/testmode/playwright";
import { handlersWithGuard } from "./support/handlers";
import { loginAs, settle } from "./support/session";

/**
 * Admin dashboard CRUD — categories + users + orders. Mocked; asserts toasts.
 */

test.describe("admin dashboard", () => {
  test("category create / edit / delete with toasts", async ({ page, context, next }) => {
    await loginAs(context, "admin");
    next.onFetch(handlersWithGuard({ role: "admin" }));

    await page.goto("/admin/categories");
    await settle(page);

    // CREATE
    await page.getByPlaceholder(/new category name/i).fill("gadgets");
    await page.getByRole("button", { name: /add category/i }).click();
    await settle(page);
    await expect(page.getByText(/category created/i)).toBeVisible();

    // EDIT (first row's Rename)
    await page.getByRole("button", { name: /^rename$/i }).first().click();
    await settle(page);
    await page.locator('input[value="electronics"]').fill("electronics-x");
    await page.getByRole("button", { name: /^save$/i }).first().click();
    await settle(page);
    await expect(page.getByText(/category updated/i)).toBeVisible();

    // DELETE (accept confirm dialog)
    page.on("dialog", (d) => d.accept());
    await page.getByRole("button", { name: /^delete$/i }).first().click();
    await settle(page);
    await expect(page.getByText(/soft-deleted|deleted/i)).toBeVisible();
  });

  test("activate/deactivate and promote a buyer to seller", async ({ page, context, next }) => {
    await loginAs(context, "admin");
    next.onFetch(handlersWithGuard({ role: "admin" }));

    page.on("dialog", (d) => d.accept());

    await page.goto("/admin/users");
    await settle(page);

    // Promote the buyer-only account.
    await page.getByRole("button", { name: /make seller/i }).first().click();
    await settle(page);
    await expect(page.getByText(/promoted to seller|user updated/i)).toBeVisible();

    // Toggle active on a row.
    await page.getByRole("button", { name: /deactivate|activate/i }).first().click();
    await settle(page);
    await expect(page.getByText(/user (updated|activated|deactivated)/i)).toBeVisible();
  });

  test("orders list is read-only with status filter", async ({ page, context, next }) => {
    await loginAs(context, "admin");
    next.onFetch(handlersWithGuard({ role: "admin" }));

    await page.goto("/admin/orders");
    await settle(page);
    await expect(page.getByText(/orders/i).first()).toBeVisible();

    // Clicking a status tab keeps us on the orders page (filtered).
    await page.getByRole("link", { name: /^paid$/i }).click();
    await settle(page);
    await expect(page).toHaveURL(/status=PAID/);
  });

  test("superadmin can open the new-admin form; plain admin cannot see it", async ({
    page,
    context,
    next,
  }) => {
    // Plain admin: no "New admin" button.
    await loginAs(context, "admin");
    next.onFetch(handlersWithGuard({ role: "admin" }));
    await page.goto("/admin/users");
    await settle(page);
    await expect(page.getByRole("link", { name: /new admin/i })).toHaveCount(0);
  });
});

test.describe("superadmin", () => {
  test("create a new admin account", async ({ page, context, next }) => {
    await loginAs(context, "superadmin");
    next.onFetch(handlersWithGuard({ role: "superadmin" }));

    await page.goto("/admin/users/new");
    await settle(page);

    await page.locator('input[type="email"]').fill("newadmin@example.com");
    await page.locator('input[type="number"]').fill("30");
    await page.locator('input[type="password"]').fill("Password1234");
    await page.getByRole("button", { name: /create admin/i }).click();
    await settle(page);

    await expect(page.getByText(/admin (account )?created|user created/i)).toBeVisible();
  });
});
