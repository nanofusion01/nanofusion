import { describe, it, expect } from "vitest";
import { resolveSiteStats, SITE_STATS_DEFAULTS } from "../lib/site-stats";

describe("resolveSiteStats", () => {
  it("bez hodnot v DB vrátí výchozí čísla", () => {
    expect(resolveSiteStats({})).toEqual(SITE_STATS_DEFAULTS);
  });

  it("hodnoty z administrace přepíšou výchozí, prázdné se ignorují", () => {
    const stats = resolveSiteStats({ stat_projects: " 1000+ ", rating_google: "", hero_title: "x" });
    expect(stats.stat_projects).toBe("1000+");
    expect(stats.rating_google).toBe(SITE_STATS_DEFAULTS.rating_google);
    expect(stats).not.toHaveProperty("hero_title");
  });
});
