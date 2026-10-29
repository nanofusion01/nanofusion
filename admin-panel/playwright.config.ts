import { defineConfig, devices } from "@playwright/test";

/**
 * E2E testy administrace. Lokálně běží proti `next dev`, v CI proti
 * produkčnímu buildu (`next build` musí proběhnout předem).
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 2,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3124",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: process.env.CI ? "npx next start --port 3124" : "npx next dev --port 3124",
    url: "http://localhost:3124/admin/login",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
