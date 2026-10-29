import { defineConfig, devices } from "@playwright/test";

/**
 * Konfigurace E2E testů pro NANOfusion Next.js web
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 2,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3123",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    // v CI proti produkčnímu buildu (npm run build musí proběhnout předem)
    command: process.env.CI ? "npx next start --port 3123" : "npx next dev --webpack --port 3123",
    url: "http://localhost:3123",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
