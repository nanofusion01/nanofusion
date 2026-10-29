/**
 * Adresa (slug) služby -> klíč ceny v tabulce configurator_prices.
 * Služby mají české adresy, ceník používá původní anglické klíče.
 * Bez tohoto převodu se cena nenašla a konfigurátor na stránce služby
 * počítal s náhradní cenou místo ceny nastavené v administraci.
 */
export const SERVICE_PRICE_KEYS: Record<string, string> = {
  "cisteni-fasad": "facade",
  "cisteni-strech": "roof",
  "cisteni-dlazby": "pavement",
  "cisteni-fotovoltaiky": "pv",
  "odstraneni-graffiti": "graffiti",
  "prumyslove-cisteni": "industrial",
  "natery-fasad": "facade-paint",
  "natery-strech": "roof-paint",
  "nano-impregnace": "impregnation",
  "protiskluzove-natery": "antislip",
  "ochrana-podlah-ceramfloor": "ceramfloor",
  "antibakterialni-ochrana": "antibac",
};

/** Klíč ceny pro samostatnou kalkulačku (/kalkulace) - čištění dlažby. */
export const CALCULATOR_PRICE_KEY = "pavement";
