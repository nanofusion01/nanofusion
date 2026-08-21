/**
 * Parsování recenzí a celkového hodnocení ze stránky Firmy.cz.
 *
 * Firmy.cz recenze do JSON-LD (schema.org) nedává - profil má jen
 * LocalBusiness/WebSite schema bez "review" pole - a stará CSS třída
 * "reviewItem__*", na kterou byl scraper dřív napsaný, na stránce vůbec
 * neexistuje (Firmy.cz mezitím přešli na Mapy.com widget s jinými třídami).
 * Obojí proto vždy vracelo 0 recenzí. Tenhle soubor je jediné místo, které
 * ví, jak aktuální HTML vypadá - používá ho jak ruční sync z adminu
 * (app/admin/reviews/actions.ts), tak denní cron (app/api/reviews/firmy/route.ts),
 * ať driftem nezůstane rozbité zase jen na jednom z těch dvou míst.
 *
 * Firmy.cz v prvotním (server-renderovaném) HTML posílá jen pár
 * nejnovějších recenzí - zbytek dotahuje JS až při scrollu do sekce
 * #hodnoceni. I tak je to výrazně víc než dřívější 0.
 */

import { stripHtml } from './strip-html'

const CZ_MONTHS: Record<string, number> = {
  ledna: 0, února: 1, března: 2, dubna: 3, května: 4, června: 5,
  července: 6, srpna: 7, září: 8, října: 9, listopadu: 10, prosince: 11,
}

function parseCzechDate(input: string): string | null {
  const m = input.match(/(\d{1,2})\.\s*(\p{L}+)\s*(\d{4})/u)
  if (!m) return null
  const month = CZ_MONTHS[m[2].toLowerCase()]
  if (month === undefined) return null
  const day = parseInt(m[1], 10)
  const year = parseInt(m[3], 10)
  return new Date(Date.UTC(year, month, day)).toISOString()
}

export interface ParsedFirmyReview {
  external_id: string
  author: string
  rating: number
  content: string
  published_at: string | null
}

export function parseFirmyReviews(html: string): ParsedFirmyReview[] {
  const reviews: ParsedFirmyReview[] = []
  const blocks = html.split('<div class="detailReview">').slice(1)

  for (const block of blocks) {
    const authorMatch = block.match(/class="authorName"><span>([^<]+)<\/span>/)
    const commentMatch = block.match(/class="comment">([\s\S]*?)<\/div>/)
    const dateMatch = block.match(/class="date subtle">([^<]+)</)
    const starsMatch = block.match(/class="reviewRating">([\s\S]*?)<\/span>\s*<span class="date/)

    const author = authorMatch ? authorMatch[1].trim() : 'Anonymní'
    const content = commentMatch ? stripHtml(commentMatch[1]) : ''
    if (content.length < 5) continue

    const rating = starsMatch
      ? Math.max(1, Math.min(5, (starsMatch[1].match(/ratingStar full/g) || []).length))
      : 5
    const published_at = dateMatch ? parseCzechDate(dateMatch[1].trim()) : null

    const extId = `firmy_${Buffer.from(author + content.substring(0, 30)).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 32)}`
    reviews.push({ external_id: extId, author, rating, content, published_at })
  }

  return reviews
}

export interface FirmyStats {
  rating: number
  reviewCount: number
}

export function parseFirmyStats(html: string): FirmyStats {
  const ratingMatch = html.match(/class="reviewBadgeNew (?:medium|big)">([\d,.]+)</)
  const countMatch = html.match(/class="badgeReviewCount">(\d+)\s*hodnocen/)
  return {
    rating: ratingMatch ? parseFloat(ratingMatch[1].replace(',', '.')) : 0,
    reviewCount: countMatch ? parseInt(countMatch[1], 10) : 0,
  }
}
