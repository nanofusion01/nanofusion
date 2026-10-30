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
* `npm run gen:types` &rarr; Obnoví TypeScript typy databáze z živého schématu Supabase

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
* **Antispam a validace:** Poptávky ze všech formulářů i z chatu se ukládají přes API routu `/api/inquiry` (new-frontend): serverová Zod validace, honeypot, limity délky polí a rate limit 5 poptávek / 10 min na IP adresu. Fotka se nahrává do privátního bucketu a URL si server sestaví sám z ověřeného názvu souboru.
* **Přepisy chatu:** Konverzace s Nanobotem se ukládají přes `/api/chat-session` (validace, rate limit, service role) – web proto potřebuje `SUPABASE_SERVICE_ROLE_KEY`.
* **Rate limit AI chatbota:** Edge funkce `nano-assistant` povolí max. 30 zpráv za hodinu z jedné IP adresy (`CHAT_LIMIT_PER_HOUR`), aby nešlo navyšovat účet za OpenAI.
* **Chybové hlášky v administraci:** Serverové akce vrací chyby jako hodnotu (`safeAction` / `unwrapActions` v `lib/action-result.ts`), takže administrátor i v produkci vidí skutečný důvod chyby.
* **Nové účty:** Dočasné heslo se generuje kryptograficky bezpečně a uživatel si ho musí po prvním přihlášení změnit (`app_metadata.force_password_change`, vynucuje `proxy.ts`).
* **On-Demand Revalidace:** Synchronizace změn z CMS do veřejného webu probíhá přes zabezpečený endpoint `/api/revalidate` chráněný tokenem `REVALIDATION_TOKEN`.

---

## 🛠️ Pokyny pro nasazení do produkce (Supabase Checklist)

Při nasazení do produkce je potřeba provést tyto kroky v **Supabase Dashboard** (kroky 1 a 2 jsou již hotové):

1. **Aplikace bezpečnostní migrace:**
   * Otevřete **SQL Editor** v Supabase Dashboard.
   * Vložte a spusťte obsah souboru `admin-panel/supabase/migrations/014_security_role_protection.sql`.
   * Tím se vytvoří privátní bucket `inquiries` s limity velikosti a MIME typů, přidají se sloupce pro fotografie a aktivují se triggery chránící role a registrace.

2. **Vypnutí veřejné registrace:**
   * V Supabase Dashboard přejděte do **Authentication** &rarr; **Sign In / Providers** &rarr; **Email**.
   * Přepněte **Allow new users to sign up** na **OFF (vypnuto)**.
   * *Důvod:* Zabezpečení CMS vyžaduje, aby účty vytvářel výhradně stávající administrátor přes administrační rozhraní (`/admin/users`), nikoli anonymní návštěvníci z internetu.

3. **Rate limit (migrace 015):**
   * V **SQL Editoru** spusťte `admin-panel/supabase/migrations/015_rate_limits.sql`.
   * Nasaďte novou verzi chatbota: `supabase functions deploy nano-assistant` (v `admin-panel/`).
   * Bez migrace vše funguje dál, jen bez rate limitu.

4. **Uzamčení přímého zápisu poptávek (volitelné, doporučené):**
   * Na Vercelu u projektu `nanofusion` nastavte `SUPABASE_SERVICE_ROLE_KEY` a nasaďte web.
   * Až potom spusťte `admin-panel/supabase/scripts/lock_public_writes.sql`. Poptávky a přepisy chatu pak nejde uložit jinak než přes serverové API webu.

---

## ☁️ Nasazení (Vercel)

Repozitář nasazují dva samostatné Vercel projekty, každý ze své složky:

| Vercel projekt | Root Directory | Adresa |
|---|---|---|
| `nanofusion` | `new-frontend` | veřejný web |
| `nanofusion-j3bs` | `admin-panel` | administrace (`/admin`) |

Proměnné prostředí obou projektů odpovídají souborům `.env.example`. Dokud doména `nanofusion.cz` neukazuje na nový web, nastavte:
* u webu `NEXT_PUBLIC_SITE_URL=https://nanofusion.vercel.app` (canonical, sitemap, Open Graph),
* u administrace `PUBLIC_SITE_URL` a `NEW_FRONTEND_URL` na stejnou adresu.

Push do `main` nasazuje oba projekty do produkce, proto změny jdou přes pull request: GitHub Actions (`.github/workflows/ci.yml`) spustí TypeScript, ESLint, unit testy, build a E2E testy obou aplikací a Vercel vytvoří preview.

---

## 🧪 Automatizované testování (Vitest & Playwright)

Všechny testy automaticky spouští CI na každém pull requestu.

### 1. Jednotkové testy (Vitest)
```bash
# Spuštění testů z kořene repozitáře
npm test

# Nebo přímo v new-frontend
cd new-frontend && npm test
```

#### Pokryté moduly (30 testů):
1. **`calculator.test.ts`**: Skutečné produkční funkce kalkulačky (`calculateSimplePrice`, `calculateRangeEstimate`), matematické zaokrouhlování na desítky, 10% rezerva a ošetření chybných vstupů (0 m², záporné hodnoty).
2. **`inquiry.test.ts`**: Striktní Zod schéma validace poptávek (povinný e-mail pro Kontaktní formulář, telefon min. 9 číslic, podpora e-mailu i v chatu, ochrana před zadaným "000000000").
3. **`sanitize.test.ts`**: Bezpečnostní testy XSS sanitizace přes `isomorphic-dompurify` (eliminace `<script>`, SVG `onload`, `javascript:` URI a vnořených tagů).
4. **`optimize-img.test.ts`**: Zmenšování obrázků přes Supabase Image Transformation.

Testy `inquiry.test.ts` pokrývají i sestavení záznamu poptávky na serveru a ochranu proti podvržené cestě k fotce.

### 2. End-to-End testy (Playwright)
* **`new-frontend/e2e/`** (7 testů): kalkulačka, honeypot, odeslání poptávky z kalkulačky i kontaktního formuláře, zobrazení chyby z API ve formuláři a navigace. Volání `/api/inquiry` se zachytává, takže do databáze nevznikají testovací data.
* **`admin-panel/e2e/`** (7 testů): přesměrování nepřihlášených na login, `noindex`, přesměrování starých veřejných adres na web a přihlášení se zobrazením poptávek (spustí se jen s testovacím účtem v `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD`).

```bash
cd new-frontend            # nebo admin-panel
npx playwright install chromium   # jednorázově
npm run test:e2e
```

---

## 📂 Struktura migrací a skriptů Supabase

Databázová schémata a migrace v `admin-panel/supabase/`:
* **`migrations/`**: Sekvenčně číslované migrace `001_` až `015_` pro deterministickou reprodukci schématu od prázdné databáze až po produkční stav včetně RLS politik.
* **`scripts/`**: Pomocné jednorázové skripty (`clean_bot_data.sql`, `fix_photos_rls.sql`, `repair_database.sql`, `lock_public_writes.sql`), oddělené od migrací.

TypeScript typy databáze (`database.types.ts` v obou aplikacích) se generují z živého schématu příkazem `npm run gen:types` (z kořene repozitáře, čte `admin-panel/.env.local`). Po každé migraci je obnovte.

---

## 🗺️ Architektonický plán pro budoucí rozvoj (Doporučení pro produkci)

1. **Turborepo monorepo**: Přechod na strukturu `apps/web`, `apps/admin` a `packages/database`, `packages/ui` pro plně sdílené TypeScript balíčky a centralizovaný build cache.
2. **Odstranění zbývajících `any`**: Supabase klienti jsou typovaní a v administraci zbývá 48 přetypování `as any` (ze 194) – hlavně u formulářových dat a JSON polí.
3. **Cloudflare Turnstile** na veřejných formulářích jako další vrstva ochrany proti botům (vyžaduje účet Cloudflare a klíče).

