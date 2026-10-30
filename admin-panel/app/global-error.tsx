'use client'

import { useEffect } from 'react'
import './globals.css'

/** Poslední záchrana, když selže i kořenový layout administrace. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Kritická chyba administrace:', error)
  }, [error])

  return (
    <html lang="cs">
      <body className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-base)' }}>
        <div className="text-center">
          <h1 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Administraci se nepodařilo načíst
          </h1>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            {error.digest ? `Kód chyby: ${error.digest}` : 'Zkuste to prosím znovu.'}
          </p>
          <button
            onClick={reset}
            className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white cursor-pointer"
            style={{ background: 'var(--brand-primary)' }}
          >
            Zkusit znovu
          </button>
        </div>
      </body>
    </html>
  )
}
