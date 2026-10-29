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

3. **`public/` & Kořenové soubory**
   * Původní statické podklady a assety zachované pro zpětnou kompatibilitu a archivaci.

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
* `npm run dev:legacy` &rarr; Spustí původní archivní statickou verzi

### 3. Veřejný web (`new-frontend`)
```bash
cd new-frontend
cp .env.example .env.local   # Vyplňte přístupy k Supabase
npm install
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
* **Ochrana před eskalací práv:** Databázový trigger `tr_protect_profile_role` a procedura `handle_new_user` blokují anonymní veřejné registrace a zaručují, že běžní uživatelé nemohou povýšit svá oprávnění na `admin`.
* **GDPR a ochrana fotografií:** Snímky nemovitostí z poptávek se ukládají do privátního bucketu `inquiries` (max 10 MB, pouze obrázky). Zákaznická data jsou chráněna před veřejným internetem a v administraci se generují časově omezené podepsané odkazy (`createSignedUrls`).
* **XSS Ochrana:** Veškerý dynamický HTML obsah vkládaný přes `dangerouslySetInnerHTML` je důsledně sanitizován pomocí knihovny `isomorphic-dompurify`.
* **Antispam a validace:** Veřejné formuláře (poptávky, kalkulátor) jsou chráněny honeypotem, validací vstupů a bezpečným nahráváním souborů do dedikovaného bucketu.
* **On-Demand Revalidace:** Synchronizace změn z CMS do veřejného webu probíhá přes zabezpečený endpoint `/api/revalidate` chráněný tokenem `REVALIDATION_TOKEN`.

---

## 🛠️ Pokyny pro nasazení do produkce (Supabase Checklist)

Před odevzdáním a nasazením do produkce je nutné provést následující dva kroky v **Supabase Dashboard**:

1. **Aplikace bezpečnostní migrace:**
   * Otevřete **SQL Editor** v Supabase Dashboard.
   * Vložte a spusťte obsah souboru `admin-panel/supabase/migrations/010_security_role_protection.sql`.
   * Tím se vytvoří privátní bucket `inquiries` s limity velikosti a MIME typů, přidají se sloupce pro fotografie a aktivují se triggery chránící role a registrace.

2. **Vypnutí veřejné registrace:**
   * V Supabase Dashboard přejděte do **Authentication** &rarr; **Sign In / Providers** &rarr; **Email**.
   * Přepněte **Allow new users to sign up** na **OFF (vypnuto)**.
   * *Důvod:* Zabezpečení CMS vyžaduje, aby účty vytvářel výhradně stávající administrátor přes administrační rozhraní (`/admin/users`), nikoli anonymní návštěvníci z internetu.

