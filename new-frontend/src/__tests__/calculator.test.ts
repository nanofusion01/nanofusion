import { describe, it, expect } from "vitest";
import { calculateSimplePrice, calculateRangeEstimate } from "../lib/calculator";

describe("Calculator Application Logic (calculator.ts)", () => {
  describe("calculateSimplePrice (kalkulace)", () => {
    it("calculates exact price based on area and pricePerSqm", () => {
      // Dlažba: 150 m² × 120 Kč
      expect(calculateSimplePrice(150, 120)).toBe(18000);
      // Fasády: 80 m² × 150 Kč
      expect(calculateSimplePrice(80, 150)).toBe(12000);
    });

    it("handles decimal inputs with mathematical rounding", () => {
      expect(calculateSimplePrice(33.3, 120)).toBe(3996);
      expect(calculateSimplePrice(10.5, 150)).toBe(1575);
    });

    it("returns 0 for non-positive or invalid inputs", () => {
      expect(calculateSimplePrice(0, 120)).toBe(0);
      expect(calculateSimplePrice(-50, 120)).toBe(0);
      expect(calculateSimplePrice(100, 0)).toBe(0);
      expect(calculateSimplePrice(100, -10)).toBe(0);
    });
  });

  describe("calculateRangeEstimate (ServiceConfigurator)", () => {
    it("calculates rounded min/max estimation range for services", () => {
      const area = 120;
      const basePrice = 150; // 150 Kč / m²
      const result = calculateRangeEstimate(area, basePrice);

      expect(result.base).toBe(18000);
      expect(result.min).toBe(18000);
      expect(result.max).toBe(19800); // +10 % rezerva
      expect(result.max).toBeGreaterThan(result.min);
    });

    it("rounds min and max to whole tens for decimal calculation bases", () => {
      const area = 75.5;
      const basePrice = 190;
      const result = calculateRangeEstimate(area, basePrice);

      // base: 14345 -> min: 14350, max: 15780
      expect(result.base).toBe(14345);
      expect(result.min).toBe(14350);
      expect(result.max).toBe(15780);
    });

    it("returns zero estimate for invalid or empty inputs", () => {
      expect(calculateRangeEstimate(0, 150)).toEqual({ min: 0, max: 0, base: 0 });
      expect(calculateRangeEstimate(-10, 150)).toEqual({ min: 0, max: 0, base: 0 });
      expect(calculateRangeEstimate(100, 0)).toEqual({ min: 0, max: 0, base: 0 });
    });
  });
});
