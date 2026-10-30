import { supabase } from "./supabase";

/**
 * Čísla a hodnocení zobrazovaná na webu (úvod, recenze, stránky služeb).
 * Upravují se v administraci (Hero sekce → Čísla na webu) a ukládají se do
 * site_config; když hodnota v DB chybí, použije se výchozí.
 */
export const SITE_STATS_DEFAULTS = {
  stat_projects: "950+",
  stat_area: "745 000",
  stat_years: "14",
  rating_firmy: "4,9",
  rating_google: "5,0",
};

export type SiteStats = typeof SITE_STATS_DEFAULTS;

const KEYS = Object.keys(SITE_STATS_DEFAULTS) as (keyof SiteStats)[];

/** Sloučí hodnoty z site_config (klíč → hodnota) s výchozími; prázdné hodnoty ignoruje. */
export function resolveSiteStats(config: Record<string, string | null | undefined>): SiteStats {
  const stats = { ...SITE_STATS_DEFAULTS };
  for (const key of KEYS) {
    const value = config[key]?.trim();
    if (value) stats[key] = value;
  }
  return stats;
}

export async function getSiteStats(): Promise<SiteStats> {
  const { data } = await supabase.from("site_config").select("key, value").in("key", KEYS);
  return resolveSiteStats(Object.fromEntries((data ?? []).map((r) => [r.key, r.value])));
}
