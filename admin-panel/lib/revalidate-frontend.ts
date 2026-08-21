/**
 * Řekne new-frontend (samostatný Next.js/Vercel projekt), ať zahodí svou
 * statickou cache a při další návštěvě znovu natáhne aktuální data z DB.
 * new-frontend generuje stránky staticky při buildu a bez tohohle volání by
 * se úpravy z adminu na živém webu neprojevily dřív, než při dalším
 * nasazení - viz app/api/revalidate/route.ts na straně new-frontend.
 *
 * Vyžaduje dvě proměnné prostředí (obě musí být nastavené ve Vercelu u
 * admin-panel projektu):
 *   NEW_FRONTEND_URL     - např. https://nanofusion.vercel.app
 *   REVALIDATION_TOKEN   - stejná hodnota, jakou má REVALIDATION_TOKEN
 *                           u projektu "nanofusion" (new-frontend)
 *
 * Nikdy nehází chybu ven - pokud selže, uložení v adminu má přesto proběhnout
 * v pořádku, jen se web neobnoví hned samo (dožene se to při dalším deploy).
 */
export async function revalidateFrontend() {
  const base = process.env.NEW_FRONTEND_URL
  const secret = process.env.REVALIDATION_TOKEN

  if (!base || !secret) {
    console.warn('revalidateFrontend: chybí NEW_FRONTEND_URL nebo REVALIDATION_TOKEN, přeskakuji')
    return
  }

  try {
    const res = await fetch(`${base.replace(/\/$/, '')}/api/revalidate?secret=${encodeURIComponent(secret)}`, {
      method: 'POST',
    })
    if (!res.ok) {
      console.warn('revalidateFrontend: new-frontend odpověděl', res.status)
    }
  } catch (e) {
    console.warn('revalidateFrontend: volání selhalo', e)
  }
}
