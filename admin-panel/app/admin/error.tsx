'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

/**
 * Neočekávaná chyba v sekci administrace. Postranní menu zůstává, takže se
 * dá pokračovat jinde; detail chyby se zobrazí, aby šel nahlásit.
 */
export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Chyba administrace:', error)
  }, [error])

  return (
    <div
      className="max-w-xl mx-auto mt-10 rounded-xl p-8 text-center"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
    >
      <AlertTriangle size={40} className="mx-auto mb-4" style={{ color: 'var(--status-danger)' }} />
      <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
        Tuto sekci se nepodařilo načíst
      </h1>
      <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
        Zkuste to znovu. Pokud chyba trvá, pošlete správci kód níže.
      </p>
      <p
        className="text-xs font-mono rounded-lg px-3 py-2 mb-6 break-all"
        style={{ background: 'var(--bg-surface-2)', color: 'var(--text-secondary)' }}
      >
        {error.digest ? `Kód chyby: ${error.digest}` : error.message}
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={reset}
          className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white cursor-pointer"
          style={{ background: 'var(--brand-primary)' }}
        >
          Zkusit znovu
        </button>
        <Link
          href="/admin"
          className="rounded-lg px-5 py-2.5 text-sm font-semibold"
          style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}
        >
          Na přehled
        </Link>
      </div>
    </div>
  )
}
