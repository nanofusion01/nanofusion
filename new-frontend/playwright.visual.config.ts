import { defineConfig, devices } from "@playwright/test";

/**
 * Vizuální regresní testy - porovnají vzhled stránek se snímky pořízenými
 * před změnou. Snímky závisí na OS a na obsahu v databázi, proto se
 * necommitují a nespouští se v CI; slouží jako pojistka při refaktoringu:
 *
 *   npm run test:visual:baseline   # před změnou (na výchozím stavu)
 *   npm run test:visual            # po změně - selže, pokud se vzhled liší
 */
export default defineConfig({
  testDir: "./e2e-visual",
  snapshotPathTemplate: "{testDir}/__snapshots__/{projectName}/{arg}{ext}",
  fullyParallel: true,
  workers: 2,
  timeout: 60_000,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report-visual" }]],
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.002, animations: "disabled", caret: "hide" },
  },
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3124",
    locale: "cs-CZ",
    timezoneId: "Europe/Prague",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    // produkční build - stabilnější než dev server (npm run build musí proběhnout předem)
    command: "npx next start --port 3124",
    url: "http://localhost:3124",
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },
});
