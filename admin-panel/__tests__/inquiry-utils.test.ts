import { describe, it, expect } from 'vitest'
import {
  cleanInquiryMessage,
  collectInquiryPhotos,
  inquiriesToCsv,
  inquiryArea,
  type Inquiry,
} from '../app/admin/inquiries/inquiry-utils'

const inquiry = (patch: Partial<Inquiry>): Inquiry =>
  ({ id: '1', created_at: '2026-10-01T10:00:00Z', name: 'Jan', status: 'new', message: '', ...patch }) as Inquiry

describe('inquiryArea', () => {
  it('vytáhne plochu ze zprávy z kalkulačky', () => {
    expect(inquiryArea('Služba: fasáda\nPlocha: 120 m²')).toBe('120')
    expect(inquiryArea('bez plochy')).toBeNull()
    expect(inquiryArea(null)).toBeNull()
  })
})

describe('cleanInquiryMessage', () => {
  it('odstraní vložené fotky a prázdné řádky', () => {
    const msg = 'Dobrý den\n\nFotografie (1): https://x.cz/a.jpg\n\nDíky'
    expect(cleanInquiryMessage(msg)).toBe('Dobrý den\nDíky')
  })
})

describe('collectInquiryPhotos', () => {
  it('spojí fotky ze sloupců a ze zprávy bez duplicit', () => {
    const photos = collectInquiryPhotos(
      inquiry({
        original_photo_url: 'https://x.cz/a.jpg',
        photo_url: 'https://x.cz/a.jpg',
        message: 'viz https://x.cz/b.png a https://x.cz/stranka',
      })
    )
    expect(photos).toEqual(['https://x.cz/a.jpg', 'https://x.cz/b.png'])
  })
})

describe('inquiriesToCsv', () => {
  it('zdvojí uvozovky a zabrání spuštění vzorce v Excelu', () => {
    const csv = inquiriesToCsv([inquiry({ name: 'Jan "Honza" Novák', message: '=HYPERLINK("x")\nřádek' })])
    const row = csv.split('\n')[1]
    expect(row).toContain('"Jan ""Honza"" Novák"')
    expect(row).toContain(`"'=HYPERLINK(""x"") řádek"`)
    expect(row).toContain('"Nová"')
  })
})
