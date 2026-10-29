import { unstable_rethrow } from 'next/navigation'

/**
 * Výsledek serverové akce. V produkčním buildu Next.js skryje zprávu každé
 * chyby vyhozené ze server action ("An error occurred in the Server
 * Components render...") a administrátor by se nedozvěděl, co se stalo.
 * Akce proto chyby nevyhazují, ale vrací je jako hodnotu - a na klientu je
 * `unwrapActions()` zase převede na běžnou chybu se skutečnou zprávou.
 */
export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string }

export async function safeAction<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await fn() }
  } catch (e) {
    // redirect() / notFound() fungují přes vyhozenou chybu - ty musí projít dál
    unstable_rethrow(e)
    const message = e instanceof Error ? e.message : 'Neznámá chyba'
    console.error('Server action error:', e)
    return { ok: false, error: message }
  }
}

export function unwrapResult<T>(result: ActionResult<T>): T {
  if (!result.ok) throw new Error(result.error)
  return result.data
}

type Unwrapped<M> = {
  [K in keyof M]: M[K] extends (...args: infer A) => Promise<ActionResult<infer T>>
    ? (...args: A) => Promise<T>
    : M[K]
}

/**
 * Obalí modul serverových akcí tak, aby se volaly stejně jako dřív:
 * vrací přímo data a při chybě vyhodí Error se skutečnou zprávou.
 */
export function unwrapActions<M extends Record<string, unknown>>(mod: M): Unwrapped<M> {
  const out: Record<string, unknown> = {}
  for (const [name, value] of Object.entries(mod)) {
    out[name] =
      typeof value === 'function'
        ? async (...args: unknown[]) =>
            unwrapResult(await (value as (...a: unknown[]) => Promise<ActionResult<unknown>>)(...args))
        : value
  }
  return out as Unwrapped<M>
}
