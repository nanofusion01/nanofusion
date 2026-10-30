/**
 * Čísla a hodnocení zobrazovaná na veřejném webu (site_config). Výchozí
 * hodnoty musí odpovídat new-frontend/src/lib/site-stats.ts.
 */
export const SITE_STATS_FIELDS = [
  { key: 'stat_projects', label: 'Dokončených projektů', default: '950+' },
  { key: 'stat_area', label: 'm² ošetřených ploch', default: '745 000' },
  { key: 'stat_years', label: 'Let zkušeností', default: '14' },
  { key: 'rating_firmy', label: 'Hodnocení na Firmy.cz', default: '4,9' },
  { key: 'rating_google', label: 'Hodnocení na Google', default: '5,0' },
] as const

export type SiteStatKey = (typeof SITE_STATS_FIELDS)[number]['key']
export const SITE_STAT_KEYS: string[] = SITE_STATS_FIELDS.map((f) => f.key)
