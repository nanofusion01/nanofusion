'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { CheckCircle, RotateCcw, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { setChatSessionStatus, deleteChatSession } from '../actions'

export function ChatDetailActions({ id, status }: { id: string; status: 'open' | 'closed' }) {
  const [loading, setLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const router = useRouter()

  const handleToggleStatus = async () => {
    setLoading(true)
    try {
      await setChatSessionStatus(id, status === 'open' ? 'closed' : 'open')
      toast.success(status === 'open' ? 'Konverzace uzavřena' : 'Konverzace znovu otevřena')
    } catch (e: any) {
      toast.error(e.message || 'Chyba při ukládání stavu')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setLoading(true)
    try {
      await deleteChatSession(id)
      toast.success('Konverzace smazána')
      router.push('/admin/chats')
    } catch (e: any) {
      toast.error(e.message || 'Chyba při mazání')
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleToggleStatus}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-60"
        style={
          status === 'open'
            ? { background: '#f0fdf4', color: '#16a34a' }
            : { background: '#eff6ff', color: '#2563eb' }
        }
      >
        {status === 'open' ? <CheckCircle size={14} /> : <RotateCcw size={14} />}
        {status === 'open' ? 'Označit jako vyřešené' : 'Znovu otevřít'}
      </button>

      {!deleteConfirm ? (
        <button
          onClick={() => setDeleteConfirm(true)}
          className="p-1.5 rounded-lg transition-all"
          style={{ color: '#ef4444' }}
          title="Smazat konverzaci"
        >
          <Trash2 size={15} />
        </button>
      ) : (
        <div className="flex items-center gap-1.5 text-xs">
          <span style={{ color: 'var(--text-muted)' }}>Opravdu smazat?</span>
          <button onClick={handleDelete} disabled={loading} className="font-semibold" style={{ color: '#ef4444' }}>
            Ano
          </button>
          <button onClick={() => setDeleteConfirm(false)} style={{ color: 'var(--text-muted)' }}>
            Ne
          </button>
        </div>
      )}
    </div>
  )
}
