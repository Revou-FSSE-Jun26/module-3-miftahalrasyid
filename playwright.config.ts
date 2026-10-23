import { defineConfig, devices } from "@playwright/test";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [["html", { outputFolder: "playwright-report" }]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: "http://localhost:3000",

    /* Collect trace when retrying the failed test. */
    trace: "on-first-retry",

    launchOptions: {
      // ✅ FIX GLOBAL: Jika berjalan di GitHub Actions (CI), paksa browser melambat 500ms
      // di setiap langkah tindakan agar halaman Next.js yang lambat di server CI selesai dirender.
      slowMo: process.env.CI
        ? 500
        : process.env.PW_SLOWMO
          ? Number(process.env.PW_SLOWMO)
          : 300,

      // ✅ TAMBAHKAN INI: Memastikan browser di server Linux GitHub Actions
      // berjalan dalam mode headless yang stabil dengan argumen performa tinggi
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },

    /* Generous per-action / per-navigation timeouts for the mocked suite. */
    actionTimeout: 15_000,
    navigationTimeout: 15_000,
  },

  /* Configure projects for major browsers.
     The mocked E2E suite runs on Chromium only for speed; add firefox/webkit
     back if you want cross-browser coverage. */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },

    // {
    //   name: "firefox",
    //   use: { ...devices["Desktop Firefox"] },
    // },

    // {
    //   name: "webkit",
    //   use: { ...devices["Desktop Safari"] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Boot the app in TEST MODE before the suite:
     - plain `next dev`; testmode injects the proxy per-request (no flag needed).
     - NEXT_PUBLIC_TEST_MODE=1 flips axios to the fetch adapter (see README) and
       renders the test-only Google button.
     reuseExistingServer locally so you can keep a server running for `--ui`. */
  webServer: {
    /* Jika berjalan di GitHub Actions (CI), paksa frontend untuk menembak API Backend Railway Anda yang sedang hidup */
    command: process.env.CI
      ? "NEXT_PUBLIC_TEST_MODE=1 NEXT_PUBLIC_API_BASE_URL=https://railway.app npx next dev --port 3000"
      : "NEXT_PUBLIC_TEST_MODE=1 npx next dev --port 3000",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
