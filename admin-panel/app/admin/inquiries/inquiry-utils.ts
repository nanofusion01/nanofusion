import type { Tables } from '@/lib/database.types'

export type Inquiry = Tables<'inquiries'> & {
  original_photo_url?: string | null
  photo_url?: string | null
  image_url?: string | null
}

export const STATUS_LABELS: Record<string, string> = {
  new: 'Nová',
  in_progress: 'V řešení',
  resolved: 'Vyřešeno',
}

export const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  new: { bg: '#eff6ff', text: '#2563eb' },
  in_progress: { bg: '#fffbeb', text: '#d97706' },
  resolved: { bg: '#f0fdf4', text: '#16a34a' },
}

/** Plocha v m² ze zprávy poptávky (kalkulačka ji zapisuje jako „Plocha: 120 m²“). */
export function inquiryArea(message: string | null): string | null {
  return message?.match(/Plocha:\s*(\d+)/)?.[1] ?? null
}

/** Text zprávy bez vložených fotek (odkazy a base64), které se zobrazují zvlášť. */
export function cleanInquiryMessage(message: string): string {
  return message
    .replace(/Fotografie\s*(\(\d+\))?:\s*/gi, '')
    .replace(/data:image\/[a-zA-Z]+;base64,[A-Za-z0-9+/=]+/g, '')
    .replace(/https?:\/\/[^\s\n]+\.(jpg|jpeg|png|webp|gif)[^\s\n]*/gi, '')
    .replace(/\n\s*\n/g, '\n')
    .trim()
}

/** Všechny fotky poptávky - ze sloupců i z odkazů ve zprávě (starší poptávky), bez duplicit. */
export function collectInquiryPhotos(inquiry: Inquiry): string[] {
  const photos: string[] = []
  for (const url of [inquiry.original_photo_url, inquiry.photo_url, inquiry.image_url]) {
    if (url && !photos.includes(url)) photos.push(url)
  }
  const matches = inquiry.message?.match(/(data:image\/[a-zA-Z]+;base64,[A-Za-z0-9+/=]+|https?:\/\/[^\s\n]+)/g) ?? []
  for (const url of matches) {
    const isImage =
      url.startsWith('data:image/') ||
      /\.(jpg|jpeg|png|webp|gif)/i.test(url) ||
      url.includes('/storage/v1/object/public/')
    if (isImage && !photos.includes(url)) photos.push(url)
  }
  return photos
}

/**
 * Buňka CSV: uvozovky se zdvojí a hodnoty začínající =, +, - nebo @ dostanou
 * apostrof, aby je Excel nespustil jako vzorec (CSV injection).
 */
function csvCell(value: string): string {
  const safe = /^[=+\-@]/.test(value) ? `'${value}` : value
  return `"${safe.replace(/"/g, '""')}"`
}

export function inquiriesToCsv(inquiries: Inquiry[]): string {
  const headers = ['Datum', 'Jméno', 'E-mail', 'Telefon', 'Služba', 'Stav', 'Zdroj', 'Zpráva']
  const rows = inquiries.map((inq) => [
    new Date(inq.created_at).toLocaleDateString('cs-CZ'),
    inq.name || '',
    inq.email || '',
    inq.phone || '',
    inq.service || '',
    STATUS_LABELS[inq.status] || inq.status,
    inq.source || '',
    (inq.message || '').replace(/[\n\r]+/g, ' '),
  ])
  return [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\n')
}
