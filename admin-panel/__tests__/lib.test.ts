import { describe, it, expect } from 'vitest'
import { safeAction, unwrapResult, unwrapActions } from '@/lib/action-result'
import { errorMessage, oneOf, normalizeMediaUrl } from '@/lib/utils'
import { inquirySourceLabel } from '@/lib/inquiry-source-label'
import { stripHtml } from '@/lib/strip-html'

describe('safeAction / unwrapActions – chyby serverových akcí', () => {
  it('vrátí data úspěšné akce', async () => {
    expect(await safeAction(async () => 42)).toEqual({ ok: true, data: 42 })
  })

  it('chybu vrátí jako hodnotu se skutečnou zprávou', async () => {
    const res = await safeAction(async () => {
      throw new Error('Tato operace vyžaduje administrátorská oprávnění.')
    })
    expect(res).toEqual({ ok: false, error: 'Tato operace vyžaduje administrátorská oprávnění.' })
  })

  it('unwrapActions na klientu z výsledku zase udělá chybu se zprávou', async () => {
    const mod = {
      ok: async (x: number) => safeAction(async () => x * 2),
      fail: async () =>
        safeAction(async (): Promise<void> => {
          throw new Error('Nelze smazat posledního administrátora.')
        }),
    }
    const actions = unwrapActions(mod)
    await expect(actions.ok(21)).resolves.toBe(42)
    await expect(actions.fail()).rejects.toThrow('Nelze smazat posledního administrátora.')
  })

  it('unwrapResult vyhodí chybu u neúspěchu', () => {
    expect(unwrapResult({ ok: true, data: 'x' })).toBe('x')
    expect(() => unwrapResult({ ok: false, error: 'boom' })).toThrow('boom')
  })
})

describe('pomocné funkce', () => {
  it('errorMessage zvládne Error, objekt se zprávou i cokoli jiného', () => {
    expect(errorMessage(new Error('a'))).toBe('a')
    expect(errorMessage({ message: 'b', code: '42501' })).toBe('b')
    expect(errorMessage('c')).toBe('c')
  })

  it('oneOf zúží text z DB na povolené hodnoty', () => {
    const roles = ['admin', 'editor'] as const
    expect(oneOf('admin', roles, 'editor')).toBe('admin')
    expect(oneOf('superuser', roles, 'editor')).toBe('editor')
    expect(oneOf(null, roles, 'editor')).toBe('editor')
  })

  it('normalizeMediaUrl převede odkazy YouTube a Google Drive', () => {
    expect(normalizeMediaUrl('https://youtu.be/dQw4w9WgXcQ')).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ')
    expect(normalizeMediaUrl('https://drive.google.com/file/d/ABC123/view')).toBe(
      'https://drive.google.com/uc?export=view&id=ABC123'
    )
  })

  it('inquirySourceLabel pojmenuje zdroj poptávky', () => {
    expect(inquirySourceLabel('chat')).toBe('Nanobot')
    expect(inquirySourceLabel('Subpage 2-Step Calculator')).toBe('Konfigurátor (podstránka služby)')
    expect(inquirySourceLabel(null)).toBe('Web')
  })

  it('stripHtml z recenze odstraní HTML a entity', () => {
    expect(stripHtml('<p><span style="x">Skvělá&nbsp;práce &amp; rychlost</span></p>')).toBe('Skvělá práce & rychlost')
  })
})
