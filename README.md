# NANOfusion — Webová prezentace a CMS Administrace

Moderní konverzní web a kompletní administrační systém pro společnost **NANOfusion s.r.o.**, specialistu na hloubkové čištění a nano-ochranu povrchů (střechy, fasády, dlažby, fotovoltaika).

---

## 🏛️ Architektura projektu

Projekt se skládá ze dvou hlavních moderních aplikací v Next.js a databázové vrstvy na Supabase:

1. **`new-frontend/` (Veřejný web)**
   * **Stack:** Next.js 16 (App Router), React 19, Tailwind CSS 4.
   * **Funkce:** Prezentace služeb (SSG + dynamické generování metadat pro SEO), interaktivní kalkulace cen, kontaktní formuláře s antispam ochranou, fotogalerie před/po, recenze zákazníků a AI Nanobot asistent.
   * **SEO:** Dynamický `sitemap.ts`, `robots.ts`, strukturovaná data Schema.org (LocalBusiness, Service) a 308 přesměrování ze starých slugů.

2. **`admin-panel/` (Administrační systém CMS)**
   * **Stack:** Next.js 16 (App Router), Supabase Auth & PostgreSQL, Radix UI, Tiptap Rich-Text Editor.
   * **Funkce:** Správa a export poptávek (CSV), schvalování recenzí z Google a Firmy.cz (automatizovaný scraping chráněný cron secretem), konfigurátor ceníku služeb, správa galerií a trénování znalostní báze AI asistenta včetně vytěžování PDF dokumentů.
   * **Zabezpečení:** Všech 16 modulů Server Actions je zabezpečeno autorizačním guardem (`requireAdmin` / `requireAdminOrEditor`), relace jsou chráněny přes Next.js `proxy.ts`, a RLS politiky brání eskalaci práv.

Kořen repozitáře obsahuje jen tyto dvě aplikace a pomocné skripty v `package.json`. Původní statický web byl odstraněn – v případě potřeby je dostupný v historii gitu.

---

## 🚀 Rychlé spuštění lokálně

### 1. Požadavky
* Node.js 20+
* npm

### 2. Spuštění z kořenového adresáře (doporučeno)
* `npm run dev` &rarr; Spustí moderní Next.js 16 web (`new-frontend` na `http://localhost:3000`)
* `npm run dev:admin` &rarr; Spustí administrační systém (`admin-panel` na `http://localhost:3000/admin`)
* `npm run build` &rarr; Sestaví produkční balíček webu
* `npm run build:all` &rarr; Sestaví web i administraci
* `npm test` &rarr; Spustí sadu automatických unit testů (Vitest)
* `npm run test:e2e` &rarr; Spustí E2E testy v prohlížeči (Playwright)

Před prvním spuštěním je potřeba nainstalovat závislosti v obou aplikacích (viz níže). Pokud běží web i administrace současně, Next.js přidělí druhé aplikaci volný port (např. `3001`).

### 3. Veřejný web (`new-frontend`)
```bash
cd new-frontend
cp .env.example .env.local   # Vyplňte přístupy k Supabase
npm install
npm test                     # Spuštění testovací sady Vitest
npm run dev
```
Aplikace běží na `http://localhost:3000` (nebo `http://localhost:3100`).

### 4. Administrační panel (`admin-panel`)
```bash
cd admin-panel
cp .env.example .env.local   # Vyplňte přístupy k Supabase a servisní klíč
npm install
npm run dev
```
Aplikace běží na `http://localhost:3000/admin`.

---

## 🔒 Zabezpečení a Proměnné prostředí

Vzorové konfigurace naleznete v:
* `new-frontend/.env.example`
* `admin-panel/.env.example`

### Klíčové bezpečnostní zásady:
* **Service Role Key:** Je používán výhradně na serveru v `admin-panel` a Edge funkcích. Klient má přístup pouze přes striktní RLS politiky.
* **Server Actions:** Každá modifikační akce v administraci vyžaduje platnou relaci s rolí `admin` nebo `editor` přes společný autorizační guard `requireAdmin` / `requireAdminOrEditor`.
* **Ochrana před eskalací práv:** Veřejná registrace je v Supabase vypnutá – účty zakládá jen administrátor v `/admin/users`. Procedura `handle_new_user` navíc každému novému účtu přidělí roli `editor` (nikdy roli z metadat) a trigger `tr_protect_profile_role` zabraňuje, aby si ne-administrátor změnil roli.
* **GDPR a ochrana fotografií:** Snímky nemovitostí z poptávek se ukládají do privátního bucketu `inquiries` (max 10 MB, pouze obrázky). Zákaznická data jsou chráněna před veřejným internetem a v administraci se generují časově omezené podepsané odkazy (`createSignedUrls`).
* **XSS Ochrana:** Veškerý dynamický HTML obsah vkládaný přes `dangerouslySetInnerHTML` je důsledně sanitizován pomocí knihovny `isomorphic-dompurify`.
* **Antispam a validace:** Veřejné formuláře (poptávky, kalkulátor) jsou chráněny honeypotem, validací vstupů a bezpečným nahráváním souborů do dedikovaného bucketu.
* **On-Demand Revalidace:** Synchronizace změn z CMS do veřejného webu probíhá přes zabezpečený endpoint `/api/revalidate` chráněný tokenem `REVALIDATION_TOKEN`.

---

## 🛠️ Pokyny pro nasazení do produkce (Supabase Checklist)

Před odevzdáním a nasazením do produkce je nutné provést následující dva kroky v **Supabase Dashboard**:

1. **Aplikace bezpečnostní migrace:**
   * Otevřete **SQL Editor** v Supabase Dashboard.
   * Vložte a spusťte obsah souboru `admin-panel/supabase/migrations/014_security_role_protection.sql`.
   * Tím se vytvoří privátní bucket `inquiries` s limity velikosti a MIME typů, přidají se sloupce pro fotografie a aktivují se triggery chránící role a registrace.

2. **Vypnutí veřejné registrace:**
   * V Supabase Dashboard přejděte do **Authentication** &rarr; **Sign In / Providers** &rarr; **Email**.
   * Přepněte **Allow new users to sign up** na **OFF (vypnuto)**.
   * *Důvod:* Zabezpečení CMS vyžaduje, aby účty vytvářel výhradně stávající administrátor přes administrační rozhraní (`/admin/users`), nikoli anonymní návštěvníci z internetu.

---

## ☁️ Nasazení (Vercel)

Repozitář nasazují dva samostatné Vercel projekty, každý ze své složky:

| Vercel projekt | Root Directory | Adresa |
|---|---|---|
| `nanofusion` | `new-frontend` | veřejný web |
| `nanofusion-j3bs` | `admin-panel` | administrace (`/admin`) |

Proměnné prostředí obou projektů odpovídají souborům `.env.example`. U administrace musí `PUBLIC_SITE_URL` a `NEW_FRONTEND_URL` ukazovat na aktuální adresu veřejného webu. Push do `main` nasazuje oba projekty do produkce, proto změny jdou přes pull request a Vercel preview.

---

## 🧪 Automatizované testování (Vitest & Playwright)

Projekt obsahuje komplexní sadu jednotkových testů i připravenou konfiguraci pro End-to-End (E2E) testování:

### 1. Jednotkové testy (Vitest)
```bash
# Spuštění testů z kořene repozitáře
npm test

# Nebo přímo v new-frontend
cd new-frontend && npm test
```

#### Pokryté moduly (22 testů, 100% green):
1. **`calculator.test.ts`**: Skutečné produkční funkce kalkulačky (`calculateSimplePrice`, `calculateRangeEstimate`), matematické zaokrouhlování na desítky, 10% rezerva a ošetření chybných vstupů (0 m², záporné hodnoty).
2. **`inquiry.test.ts`**: Striktní Zod schéma validace poptávek (povinný e-mail pro Kontaktní formulář, telefon min. 9 číslic, podpora e-mailu i v chatu, ochrana před zadaným "000000000").
3. **`sanitize.test.ts`**: Bezpečnostní testy XSS sanitizace přes `isomorphic-dompurify` (eliminace `<script>`, SVG `onload`, `javascript:` URI a vnořených tagů).

### 2. End-to-End testy (Playwright)
V adresáři `new-frontend/e2e/` je testovací scénář (`inquiry-and-calculator.spec.ts`, 6 testů) pro simulaci chování uživatele v reálném prohlížeči (interakce s kalkulačkou m², ověření skrytého honeypotu, odeslání poptávky z kalkulačky i kontaktního formuláře a navigace). Volání Supabase API se v testech zachytává, takže do databáze nevznikají žádná testovací data.

```bash
cd new-frontend
# Instalace prohlížečů pro Playwright (jednorázově)
npx playwright install --with-deps

# Spuštění E2E testů
npm run test:e2e
```

---

## 📂 Struktura migrací a skriptů Supabase

Databázová schémata a migrace v `admin-panel/supabase/`:
* **`migrations/`**: Sekvenčně číslované migrace `001_` až `014_` pro deterministickou reprodukci schématu od prázdné databáze až po produkční stav včetně RLS politik.
* **`scripts/`**: Pomocné jednorázové údržbové a opravné skripty (`clean_bot_data.sql`, `fix_photos_rls.sql`, `repair_database.sql`), oddělené od oficiální migrační pipeline.

---

## 🗺️ Architektonický plán pro budoucí rozvoj (Doporučení pro produkci)

1. **Turborepo monorepo**: Přechod na strukturu `apps/web`, `apps/admin` a `packages/database`, `packages/ui` pro plně sdílené TypeScript balíčky a centralizovaný build cache.
2. **Transformace obrázků přes Supabase Storage**: Pro náhradu externí služby `wsrv.nl` využít nativní Image Transformation v rámci placeného plánu Supabase Pro.
3. **Přísnější TypeScript režim (`strict: true`)**: Postupná eliminace typů `any` v administraci ve prospěch automaticky generovaných typů `database.types.ts`.

