import { test, expect } from "@playwright/test";

test.describe("E2E Test: Kalkulačka a odeslání poptávky (/kalkulace)", () => {
  test("zobrazuje formulář, pole pro m² a skrytý antispam honeypot", async ({ page }) => {
    await page.goto("/kalkulace");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveTitle(/Kalkulace|NANOfusion/i);

    // 1. Ověření číselného pole pro m² (výchozí hodnota 100 m²)
    const areaInput = page.locator("input[type='number']");
    await expect(areaInput).toBeVisible();
    await expect(areaInput).toHaveValue("100");

    // 2. Ověření antispam honeypot pole
    const honeypot = page.locator("input[name='website_url_check']");
    await expect(honeypot).toBeAttached();
    // Musí být skryté pro reálné návštěvníky
    await expect(honeypot.locator("..")).toHaveClass(/hidden/);
  });

  test("úspěšně odešle poptávku z kalkulačky a zobrazí spočtenou cenu (se zachycením API)", async ({ page }) => {
    // Zachycení API volání do Supabase, aby nevznikala falešná data v produkční databázi
    let interceptedPayload: any = null;
    await page.route("**/rest/v1/inquiries*", async (route) => {
      if (route.request().method() === "POST") {
        interceptedPayload = route.request().postDataJSON();
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify([{ id: "test-inquiry-id", status: "new" }]),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto("/kalkulace");
    await page.waitForLoadState("networkidle");

    // Změna plochy na 150 m²
    const areaInput = page.locator("input[type='number']");
    await areaInput.fill("150");

    // Vyplnění povinných polí
    const nameInput = page.locator("input[placeholder='Vaše jméno']");
    await nameInput.fill("Jan Testovací");
    const phoneInput = page.locator("input[placeholder='Telefonní číslo']");
    await phoneInput.fill("+420 777 888 999");
    const locInput = page.locator("input[placeholder*='Praha']");
    await locInput.fill("Brno");

    // Odeslání formuláře
    const submitBtn = page.locator("button[type='submit']");
    await submitBtn.click();

    // Ověření zobrazení úspěšné zprávy a kalkulované ceny
    await expect(page.locator("text=✓ Úspěšně odesláno. Zavoláme vám.")).toBeVisible();
    await expect(page.locator(".text-5xl.text-amber-500")).toContainText("Kč");

    // Ověření správnosti zachyceného payloadu v API
    expect(interceptedPayload).not.toBeNull();
    expect(interceptedPayload.name).toBe("Jan Testovací");
    expect(interceptedPayload.phone).toBe("+420 777 888 999");
    expect(interceptedPayload.source).toBe("Kalkulačka");
  });
});

test.describe("E2E Test: Kontaktní formulář na domovské stránce (/)", () => {
  test("úspěšně odešle poptávku z kontaktního formuláře (se zachycením API)", async ({ page }) => {
    let interceptedContactPayload: any = null;
    await page.route("**/rest/v1/inquiries*", async (route) => {
      if (route.request().method() === "POST") {
        interceptedContactPayload = route.request().postDataJSON();
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify([{ id: "test-contact-id", status: "new" }]),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Scroll na kontaktní sekci
    const contactSection = page.locator("#kontakt");
    await contactSection.scrollIntoViewIfNeeded();

    // Ověření honeypotu na hlavní stránce
    const contactHoneypot = contactSection.locator("input[name='user_homepage_check']");
    await expect(contactHoneypot).toBeAttached();
    await expect(contactHoneypot.locator("..")).toHaveClass(/hidden/);

    // Vyplnění kontaktního formuláře
    await contactSection.locator("input[placeholder='Jan Novák']").fill("Petr Kontaktní");
    await contactSection.locator("input[placeholder='+420 ...']").fill("+420 608 123 456");
    await contactSection.locator("input[placeholder='jan@email.cz']").fill("petr.kontakt@example.cz");

    // Odeslání
    const contactSubmitBtn = contactSection.locator("button[type='submit']");
    await contactSubmitBtn.click();

    // Ověření úspěšné hlášky
    await expect(page.locator("text=Vaše poptávka byla úspěšně odeslána")).toBeVisible();

    // Ověření zachyceného payloadu
    expect(interceptedContactPayload).not.toBeNull();
    expect(interceptedContactPayload.name).toBe("Petr Kontaktní");
    expect(interceptedContactPayload.email).toBe("petr.kontakt@example.cz");
    expect(interceptedContactPayload.source).toBe("Kontaktní formulář");
  });
});

test.describe("E2E Test: Navigace a klíčové stránky", () => {
  test("načte domovskou stránku", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle(/NANOfusion/i);
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
  });

  test("načte stránku služeb", async ({ page }) => {
    await page.goto("/sluzby", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle(/Služby|NANOfusion/i);
    await expect(page.locator("h2").first()).toBeVisible();
  });

  test("načte stránku o nás", async ({ page }) => {
    await page.goto("/o-nas", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle(/O nás|NANOfusion/i);
  });
});
