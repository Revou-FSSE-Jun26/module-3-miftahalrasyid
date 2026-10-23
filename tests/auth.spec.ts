import { test, expect } from "next/experimental/testmode/playwright";
import { handlersWithGuard } from "./support/handlers";
import { loginAs, settle } from "./support/session";
import { CREDS } from "./support/fixtures";

/**
 * Registration + login flows — fully mocked, no backend.
 * ADDITIVE suite (does not touch products.spec.ts).
 */

test.describe("auth", () => {
  test("register a new user then verify email", async ({ page, next }) => {
    next.onFetch(handlersWithGuard({ role: "buyer" }));

    await page.goto("/auth/register");
    await settle(page);

    // Fill the signup form. A hidden Google form also has name="age"/"id_token",
    // so scope to visible inputs and target age by its id.
    await page
      .locator('input[name="email"]:visible')
      .fill("newbie@example.com");
    await page.locator("input#age").fill("25");
    await page
      .locator('input[name="password"]:visible')
      .first()
      .fill("Password1234");
    const confirm = page.locator('input[name="confirm_password"]:visible');
    if (await confirm.count()) await confirm.first().fill("Password1234");
    const terms = page.locator('input[name="terms"]');
    if (await terms.count()) await terms.first().check({ force: true });

    await page
      .getByRole("button", { name: /sign up|creating account/i })
      .click();
    await settle(page);

    // Now exercise the verify-email page with a token (confirm endpoint mocked).
    await page.goto("/auth/verify-email?token=fake-verify-token");
    await settle(page);
    await expect(
      page.getByText(/confirmation complete|verified/i),
    ).toBeVisible();
  });

  test("login with email/password (buyer)", async ({ page, next }) => {
    next.onFetch(handlersWithGuard({ role: "buyer" }));

    await page.goto("/auth/login");
    await settle(page);

    await page.locator('input[name="email"]').fill(CREDS.buyer.email);
    await page.locator('input[name="password"]').fill(CREDS.buyer.password);
    await page.getByRole("button", { name: /sign in/i }).click();
    await settle(page);

    // Logged in → redirected to home; the cart icon button is visible in header.
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByLabel(/cart/i).first()).toBeVisible();
  });

  test("login failure shows an error", async ({ page, next }) => {
    next.onFetch((req) => {
      if (req.url.includes("/api/v1/auth/login") && req.method === "POST") {
        return new Response(
          JSON.stringify({ message: "Invalid email or password." }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }
      return handlersWithGuard({ role: "buyer" })(req);
    });

    await page.goto("/auth/login");
    await settle(page);
    await page.locator('input[name="email"]').fill(CREDS.buyer.email);
    await page.locator('input[name="password"]').fill("wrongpass");
    await page.getByRole("button", { name: /sign in/i }).click();
    await settle(page);

    await expect(page.getByText(/invalid email or password/i)).toBeVisible();
  });

  // test("google login via test-only button (no Google servers)", async ({
  //   page,
  //   next,
  // }) => {
  //   next.onFetch(handlersWithGuard({ role: "buyer" }));

  //   await page.goto("/auth/login");
  //   await settle(page);

  //   // Drive the real Google path WITHOUT contacting Google: fill the hidden
  //   // id_token input the component already renders and submit its form. This
  //   // runs googleSignupAction exactly like a real Google login, but the token
  //   // is fake and the backend /auth/oauth/google call is mocked.
  //   // (Works regardless of NEXT_PUBLIC_TEST_MODE — no dependency on a rendered
  //   // test-only button or build-time env inlining.)
  //   await page.evaluate(() => {
  //     const form = document
  //       .querySelector('form input[name="id_token"]')
  //       ?.closest("form") as HTMLFormElement | null;
  //     if (!form) throw new Error("hidden google form not found");
  //     const token = form.querySelector(
  //       'input[name="id_token"]',
  //     ) as HTMLInputElement;
  //     token.value = "fake.google.id_token.for.tests";
  //     form.requestSubmit();
  //   });
  //   await settle(page);

  //   await expect(page).toHaveURL(/\/$/);
  //   await expect(page.getByTestId("cart-button")).toBeVisible();
  // });

  test("buyer cannot reach the admin area", async ({ page, context, next }) => {
    next.onFetch(handlersWithGuard({ role: "buyer" }));
    await loginAs(context, "buyer");

    await page.goto("/admin/categories");
    await settle(page);
    // Guard redirects a non-admin to home.
    await expect(page).toHaveURL(/\/$/);
  });
});
