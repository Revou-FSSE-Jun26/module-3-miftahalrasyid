import type { Page, BrowserContext } from "@playwright/test";
import { tokensFor, roleUserId, type RoleKey } from "./fixtures";

/**
 * Seed an authenticated session by injecting the same cookies the login server
 * action would set (access_token + refresh_token). getSession() decodes these
 * with jwt-decode, so a fake-but-well-formed JWT is enough — no login round-trip.
 */
export async function loginAs(context: BrowserContext, role: RoleKey) {
  const { access_token, refresh_token } = tokensFor(role, roleUserId(role));
  await context.addCookies([
    {
      name: "access_token",
      value: access_token,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
    {
      name: "refresh_token",
      value: refresh_token,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
}

/**
 * Deliberate pause after a navigation / major action so the flow is followable
 * in `playwright --ui`. Tune with PW_SETTLE (ms); 0 disables.
 */
export async function settle(page: Page, ms?: number) {
  const delay = ms ?? (process.env.PW_SETTLE ? Number(process.env.PW_SETTLE) : 700);
  if (delay > 0) await page.waitForTimeout(delay);
}
