import { test, expect } from "@playwright/test";

const PUBLIC_SITE_URL = process.env.PUBLIC_SITE_URL || "https://nanofusion.vercel.app";

test.describe("Administrace – přístup bez přihlášení", () => {
  test("nepřihlášeného uživatele pošle z /admin na přihlášení", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login$/);
    await expect(page.locator("input[type='email']")).toBeVisible();
    await expect(page.locator("button[type='submit']")).toBeVisible();
  });

  test("chráněné sekce nejsou bez přihlášení dostupné", async ({ page }) => {
    for (const path of ["/admin/inquiries", "/admin/users", "/admin/account"]) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/admin\/login$/);
    }
  });

  test("administrace se nemá indexovat ve vyhledávačích", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.locator("meta[name='robots']").first()).toHaveAttribute("content", /noindex/);
  });
});

test.describe("Administrace – staré veřejné adresy", () => {
  for (const [from, to] of [
    ["/poptavka", "/kalkulace"],
    ["/sluzby/cisteni-fasad", "/sluzby/cisteni-fasad"],
    ["/gdpr", "/gdpr"],
  ]) {
    test(`${from} přesměruje na veřejný web`, async ({ request }) => {
      const res = await request.get(from, { maxRedirects: 0 });
      expect([307, 308]).toContain(res.status());
      expect(res.headers()["location"]).toBe(`${PUBLIC_SITE_URL}${to}`);
    });
  }
});

// Přihlášení a zobrazení poptávek - spustí se jen s testovacím účtem:
//   E2E_ADMIN_EMAIL=... E2E_ADMIN_PASSWORD=... npm run test:e2e
test.describe("Administrace – přihlášený uživatel", () => {
  const email = process.env.E2E_ADMIN_EMAIL;
  const password = process.env.E2E_ADMIN_PASSWORD;
  test.skip(!email || !password, "Chybí E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD");

  test("přihlásí se a zobrazí seznam poptávek", async ({ page }) => {
    await page.goto("/admin/login");
    await page.locator("input[type='email']").fill(email!);
    await page.locator("input[autocomplete='current-password'], input[type='password']").first().fill(password!);
    await page.locator("button[type='submit']").click();
    await expect(page).not.toHaveURL(/\/admin\/login$/, { timeout: 15000 });

    await page.goto("/admin/inquiries");
    await expect(page.locator("h1")).toContainText(/poptávek/i);
  });
});
