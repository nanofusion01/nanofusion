import path from "path";
import { test, expect, type Page } from "@playwright/test";

const SERVICE_SLUGS = [
  "cisteni-fasad",
  "cisteni-strech",
  "cisteni-dlazby",
  "cisteni-fotovoltaiky",
  "odstraneni-graffiti",
  "prumyslove-cisteni",
  "natery-fasad",
  "natery-strech",
  "nano-impregnace",
  "protiskluzove-natery",
  "ochrana-podlah-ceramfloor",
  "antibakterialni-ochrana",
];

const PAGES = [
  { name: "home", path: "/" },
  { name: "kalkulace", path: "/kalkulace" },
  { name: "o-nas", path: "/o-nas" },
  { name: "obchodni-podminky", path: "/obchodni-podminky" },
  { name: "gdpr", path: "/gdpr" },
  ...SERVICE_SLUGS.map((slug) => ({ name: `sluzba-${slug}`, path: `/sluzby/${slug}` })),
];

/** Projede stránku dolů (načtení lazy obrázků), vrátí se nahoru a počká na klid. */
async function settle(page: Page) {
  // čekání na straně testu - časovače stránky jsou zmrazené (page.clock)
  const height = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < height; y += 600) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(60);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  // některé stránky drží spojení otevřené (analytika) - networkidle je jen bonus
  await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {});
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() =>
    Promise.all(
      Array.from(document.images)
        .filter((img) => !img.complete)
        .map(
          (img) =>
            new Promise((r) => {
              img.onload = img.onerror = r;
            })
        )
    )
  );
}

for (const { name, path: url } of PAGES) {
  test(name, async ({ page }) => {
    // zmrazit čas: automatické přepínání (slider před/po), pozdrav chatu apod.
    // časovače běží jen tehdy, kdy je test sám posune (runFor) - vždy stejně
    await page.clock.install({ time: new Date("2026-06-01T10:00:00+02:00") });
    await page.clock.pauseAt(new Date("2026-06-01T10:00:00+02:00"));
    await page.goto(url);
    await page.clock.runFor(2000);
    await settle(page);
    await expect(page).toHaveScreenshot(`${name}.png`, {
      fullPage: true,
      // mapa a video z YouTube se mění mimo naši kontrolu: mapu zakrýt,
      // video skrýt (pod ním je statický náhled, ten se porovná)
      mask: [page.locator('iframe:not([src*="youtube.com/embed"])')],
      stylePath: path.join(__dirname, "screenshot.css"),
    });
  });
}
