# NANOfusion – veřejný web

Next.js 16 web se stránkami služeb, kalkulačkou, konfigurátory, recenzemi, články a AI asistentem.
Celkový přehled projektu, nasazení a bezpečnostní zásady jsou v [README v kořeni repozitáře](../README.md).

## Spuštění

```bash
cp .env.example .env.local   # Supabase URL a anon klíč (volitelně service role klíč pro /api/inquiry)
npm install
npm run dev                  # http://localhost:3000
```

## Skripty

| Příkaz | Popis |
|---|---|
| `npm run dev` | vývojový server |
| `npm run build` | produkční build |
| `npm run lint` | ESLint |
| `npm test` | jednotkové testy (Vitest) |
| `npm run test:e2e` | E2E testy (Playwright) |

## Struktura

- `src/app` – stránky (App Router), `src/app/api` – serverové API (poptávky, revalidace)
- `src/components` – sekce úvodní stránky, layout, stránky služeb, UI prvky
- `src/lib` – Supabase klient, odeslání poptávky (`inquiry.ts`), výpočty cen (`calculator.ts`), sanitizace HTML, adresy webu
- `src/data` – mapování služeb na ceník a doplňkový obsah služeb
- `src/__tests__` – jednotkové testy, `e2e/` – Playwright testy
