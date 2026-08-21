/**
 * Lidsky čitelný popisek pro inquiries.source. Různá místa na webu ukládají
 * poptávky s různým textem podle toho, odkud přišly - tohle je jediné
 * místo, které ví, jak se který zdroj má v adminu zobrazit, ať se to
 * (jako dřív) nerozejde mezi dashboardem a stránkou Poptávky.
 *
 * Skutečné hodnoty, které kód dnes zapisuje (new-frontend):
 *   - "chat"                        - ChatWidget.tsx (nanobot)
 *   - "Kalkulačka"                  - app/kalkulace/page.tsx (samostatná stránka)
 *   - "Konfigurátor"                - home/ConfiguratorClient.tsx (homepage)
 *   - "Subpage 2-Step Calculator"   - services/ServiceConfigurator.tsx (podstránky služeb)
 * Starší/jiné hodnoty (kalkulacka, ai_analyzer, prázdné) necháváme jako
 * fallback pro data odjinud (např. ruční zápis, budoucí AI Analyzer).
 */
export function inquirySourceLabel(source: string | null | undefined): string {
  switch (source) {
    case 'chat':
      return 'Nanobot'
    case 'Kalkulačka':
    case 'kalkulacka':
      return 'Kalkulačka'
    case 'Konfigurátor':
    case 'konfigurator':
      return 'Konfigurátor'
    case 'Subpage 2-Step Calculator':
      return 'Konfigurátor (podstránka služby)'
    case 'ai_analyzer':
      return 'AI Analyzátor'
    default:
      return source || 'Web'
  }
}
