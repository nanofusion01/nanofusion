import type { Tables } from '@/lib/database.types'

export type Service = Tables<'services'>
export type BeforeAfter = Tables<'service_before_after'>
export type GalleryPhoto = Tables<'service_gallery'>
/** FAQ služby; is_global = obecná otázka z tabulky faqs zobrazená i u této služby */
export type ServiceFAQ = Tables<'service_faqs'> & { is_global?: boolean }
export type ServiceReview = Tables<'service_reviews'>
export type ExternalReview = Tables<'external_reviews'>
export type ProcessStep = { step: string; title: string; desc: string }

/**
 * Bod „Co nabízíme“ je v DB uložený jako text: buď JSON {title, desc},
 * nebo „Název - popis“ / „Název: popis“, případně jen název.
 */
export function parseFeature(feature: string): { title: string; desc: string } {
  try {
    const parsed: unknown = JSON.parse(feature)
    if (typeof parsed === 'object' && parsed !== null) {
      const p = parsed as { title?: string; desc?: string; description?: string }
      return { title: p.title || '', desc: p.desc || p.description || '' }
    }
    return { title: String(feature), desc: '' }
  } catch {
    for (const sep of [' - ', ': ']) {
      if (feature.includes(sep)) {
        const [first, ...rest] = feature.split(sep)
        return { title: first.trim(), desc: rest.join(sep).trim() }
      }
    }
    return { title: feature, desc: '' }
  }
}
