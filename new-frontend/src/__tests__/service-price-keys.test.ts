import { describe, it, expect } from "vitest";
import { SERVICE_PRICE_KEYS, CALCULATOR_PRICE_KEY } from "../data/servicePriceKeys";

// Klíče, které existují v tabulce configurator_prices (viz admin › Konfigurátor)
const DB_PRICE_KEYS = [
  "antibac", "antislip", "ceramfloor", "facade", "facade-paint", "graffiti",
  "impregnation", "industrial", "pavement", "pv", "roof", "roof-paint",
];

describe("Ceny služeb", () => {
  it("každá služba má cenu v ceníku", () => {
    for (const [slug, key] of Object.entries(SERVICE_PRICE_KEYS)) {
      expect(DB_PRICE_KEYS, `${slug} -> ${key}`).toContain(key);
    }
  });

  it("kalkulačka používá existující klíč ceny", () => {
    expect(DB_PRICE_KEYS).toContain(CALCULATOR_PRICE_KEY);
  });
});
