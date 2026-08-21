'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'
import { MessageSquare, Trash2 } from 'lucide-react'
import { deleteChatSessions, deleteAllChatSessions } from './actions'

type ChatSession = {
  id: string
  user_identifier: string | null
  started_at: string
  last_activity: string
  status: 'open' | 'closed'
  messages: unknown
}

export function ChatsClient({ sessions }: { sessions: ChatSession[] }) {
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false)
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [deleteAllConfirm, setDeleteAllConfirm] = useState(false)
  const [deletingAll, setDeletingAll] = useState(false)

  const openCount = sessions.filter((s) => s.status === 'open').length

  const toggleChecked = (id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const allChecked = sessions.length > 0 && sessions.every((s) => checkedIds.has(s.id))

  const toggleCheckAll = () => {
    setCheckedIds(allChecked ? new Set() : new Set(sessions.map((s) => s.id)))
  }

  const handleDeleteSelected = async () => {
    setBulkDeleting(true)
    try {
      await deleteChatSessions(Array.from(checkedIds))
      toast.success(`Smazáno ${checkedIds.size} relací`)
      window.location.reload()
    } catch (e: any) {
      toast.error(e.message || 'Chyba při mazání')
    } finally {
      setBulkDeleting(false)
      setBulkDeleteConfirm(false)
    }
  }

  const handleDeleteAll = async () => {
    setDeletingAll(true)
    try {
      await deleteAllChatSessions()
      toast.success('Všechny chat relace smazány')
      window.location.reload()
    } catch (e: any) {
      toast.error(e.message || 'Chyba při mazání')
    } finally {
      setDeletingAll(false)
      setDeleteAllConfirm(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Chaty (Nanobot)</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {sessions.length} relací · <span style={{ color: '#2563eb' }}>{openCount} otevřených</span>
          </p>
        </div>

        {sessions.length > 0 && (
          !deleteAllConfirm ? (
            <button
              onClick={() => setDeleteAllConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold"
              style={{ color: '#ef4444', background: '#fef2f2' }}
            >
              <Trash2 size={14} /> Vymazat vše
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg" style={{ background: '#fef2f2' }}>
              <span style={{ color: '#991b1b' }}>Nevratně smazat všech {sessions.length} relací?</span>
              <button onClick={handleDeleteAll} disabled={deletingAll} className="font-bold disabled:opacity-60" style={{ color: '#ef4444' }}>
                {deletingAll ? 'Mažu...' : 'Ano, smazat'}
              </button>
              <button onClick={() => setDeleteAllConfirm(false)} disabled={deletingAll} style={{ color: 'var(--text-muted)' }}>
                Zrušit
              </button>
            </div>
          )
        )}
      </div>

      {checkedIds.size > 0 && (
        <div
          className="rounded-xl px-4 py-3 flex items-center justify-between gap-3 flex-wrap"
          style={{ background: '#fef2f2', border: '1px solid #fecaca' }}
        >
          <span className="text-sm font-semibold" style={{ color: '#991b1b' }}>
            Vybráno {checkedIds.size} {checkedIds.size === 1 ? 'relace' : checkedIds.size < 5 ? 'relace' : 'relací'}
          </span>
          <div className="flex items-center gap-2">
            {!bulkDeleteConfirm ? (
              <>
                <button
                  onClick={() => setCheckedIds(new Set())}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Zrušit výběr
                </button>
                <button
                  onClick={() => setBulkDeleteConfirm(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                  style={{ background: '#ef4444' }}
                >
                  <Trash2 size={14} /> Smazat vybrané
                </button>
              </>
            ) : (
              <>
                <span className="text-xs" style={{ color: '#991b1b' }}>Opravdu smazat?</span>
                <button onClick={handleDeleteSelected} disabled={bulkDeleting} className="font-bold text-xs disabled:opacity-60" style={{ color: '#ef4444' }}>
                  {bulkDeleting ? 'Mažu...' : 'Ano, smazat'}
                </button>
                <button onClick={() => setBulkDeleteConfirm(false)} disabled={bulkDeleting} className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Zrušit
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <MessageSquare size={44} style={{ color: 'var(--text-muted)' }} />
            <p style={{ color: 'var(--text-muted)' }}>Žádné chat relace</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-base)' }}>
                <th className="px-5 py-3" style={{ width: 20 }}>
                  <input type="checkbox" checked={allChecked} onChange={toggleCheckAll} className="cursor-pointer" />
                </th>
                {['Uživatel', 'Začátek', 'Poslední aktivita', 'Zprávy', 'Stav'].map((col) => (
                  <th key={col} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sessions.map((session, i) => {
                const msgCount = Array.isArray(session.messages) ? session.messages.length : 0
                return (
                  <tr
                    key={session.id}
                    className="hover:bg-black/[0.02] transition-colors"
                    style={{ borderBottom: i < sessions.length - 1 ? '1px solid var(--border)' : undefined }}
                  >
                    <td className="px-5 py-4">
                      <input
                        type="checkbox"
                        checked={checkedIds.has(session.id)}
                        onChange={() => toggleChecked(session.id)}
                        className="cursor-pointer"
                      />
                    </td>
                    <td className="px-0 py-0">
                      <Link href={`/admin/chats/${session.id}`} className="block px-5 py-4 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {session.user_identifier || 'Anonymní'}
                      </Link>
                    </td>
                    <td className="px-0 py-0">
                      <Link href={`/admin/chats/${session.id}`} className="block px-5 py-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                        {new Date(session.started_at).toLocaleString('cs-CZ')}
                      </Link>
                    </td>
                    <td className="px-0 py-0">
                      <Link href={`/admin/chats/${session.id}`} className="block px-5 py-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                        {new Date(session.last_activity).toLocaleString('cs-CZ')}
                      </Link>
                    </td>
                    <td className="px-0 py-0">
                      <Link href={`/admin/chats/${session.id}`} className="block px-5 py-4 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {msgCount}
                      </Link>
                    </td>
                    <td className="px-0 py-0">
                      <Link href={`/admin/chats/${session.id}`} className="block px-5 py-4">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{
                          background: session.status === 'open' ? '#eff6ff' : '#f1f5f9',
                          color: session.status === 'open' ? '#2563eb' : '#94a3b8',
                        }}>
                          {session.status === 'open' ? 'Otevřený' : 'Uzavřený'}
                        </span>
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
