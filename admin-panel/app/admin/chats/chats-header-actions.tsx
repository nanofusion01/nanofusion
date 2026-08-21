'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import { deleteAllChatSessions } from './actions'

export function ChatsHeaderActions({ count }: { count: number }) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  if (count === 0) return null

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold"
        style={{ color: '#ef4444', background: '#fef2f2' }}
      >
        <Trash2 size={14} /> Vymazat vše
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg" style={{ background: '#fef2f2' }}>
      <span style={{ color: '#991b1b' }}>
        Nevratně smazat všech {count} relací?
      </span>
      <button
        onClick={async () => {
          setLoading(true)
          try {
            await deleteAllChatSessions()
            toast.success('Všechny chat relace smazány')
          } catch (e: any) {
            toast.error(e.message || 'Chyba při mazání')
          } finally {
            setLoading(false)
            setConfirming(false)
          }
        }}
        disabled={loading}
        className="font-bold disabled:opacity-60"
        style={{ color: '#ef4444' }}
      >
        {loading ? 'Mažu...' : 'Ano, smazat'}
      </button>
      <button onClick={() => setConfirming(false)} disabled={loading} style={{ color: 'var(--text-muted)' }}>
        Zrušit
      </button>
    </div>
  )
}
