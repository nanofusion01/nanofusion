# NANOfusion – administrace (CMS)

Next.js 16 aplikace pro správu obsahu webu, ceníku, poptávek, recenzí, chatbota a uživatelů.
Celkový přehled projektu, nasazení a bezpečnostní zásady jsou v [README v kořeni repozitáře](../README.md).

## Spuštění

```bash
cp .env.example .env.local   # Supabase URL, anon a service role klíč
npm install
npm run dev                  # http://localhost:3000/admin
```

## Skripty

| Příkaz | Popis |
|---|---|
| `npm run dev` | vývojový server |
| `npm run build` | produkční build (zároveň kontrola typů) |
| `npm run lint` | ESLint |
| `npm run test:e2e` | E2E testy (Playwright) |

## Struktura

- `app/admin/*` – sekce administrace; každá má `page.tsx` (načtení dat na serveru), `*-client.tsx` (UI) a `actions.ts` (serverové akce)
- `lib/action-result.ts` – `safeAction` / `unwrapActions`: chyby serverových akcí se v produkci zobrazují se skutečnou zprávou
- `lib/supabase/auth-guard.ts` – `requireAdmin` / `requireAdminOrEditor`, volá je každá serverová akce
- `proxy.ts` – ochrana tras `/admin/*`, vynucená změna dočasného hesla
- `supabase/migrations` – schéma databáze (`001`–`015`), `supabase/functions` – edge funkce (AI asistent, notifikace)
- `e2e/` – Playwright testy

Typy databáze (`lib/database.types.ts`) se generují příkazem `npm run gen:types` z kořene repozitáře.
