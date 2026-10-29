/**
 * Modul pro výpočet cen a cenových odhadů služeb.
 * Sdílená byznys logika používaná v kalkulačce i konfigurátoru služeb.
 */

export interface PriceEstimate {
  min: number;
  max: number;
  base: number;
}

/**
 * Základní výpočet ceny pro kalkulaci:
 * cena = plocha (m²) * sazba za m²
 * Zaokrouhluje na celé koruny, při neplatném zadání vrací 0.
 */
export function calculateSimplePrice(area: number, pricePerSqm: number): number {
  if (!area || typeof area !== "number" || area <= 0) return 0;
  if (!pricePerSqm || typeof pricePerSqm !== "number" || pricePerSqm <= 0) return 0;
  return Math.round(area * pricePerSqm);
}

/**
 * Výpočet cenového odhadu (min - max) pro dvoukrokový konfigurátor služeb.
 * - Min: základní cena zaokrouhlená na celé desítky.
 * - Max: základní cena + 10 % rezerva zaokrouhlená na celé desítky.
 */
export function calculateRangeEstimate(area: number, basePrice: number): PriceEstimate {
  if (!area || typeof area !== "number" || area <= 0 || !basePrice || typeof basePrice !== "number" || basePrice <= 0) {
    return { min: 0, max: 0, base: 0 };
  }
  const calcBase = basePrice * area;
  const min = Math.round(calcBase / 10) * 10;
  const max = Math.round((calcBase * 1.1) / 10) * 10;

  return { min, max, base: calcBase };
}

