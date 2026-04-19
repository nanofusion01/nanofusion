'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Star, CheckCircle, XCircle, Trash2, Plus, AlertTriangle, RefreshCw } from 'lucide-react'
import { Tables } from '@/lib/database.types'
import { approveReview, rejectReview, deleteReview, addManualReview } from './actions'

type Review = Tables<'external_reviews'>

const TAB_LABELS = {
  pending: 'Čekající',
  approved: 'Schválené',
  rejected: 'Zamítnuté',
}

function StarRating({ rating }: { rating: number | null }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={14}
          fill={n <= (rating ?? 0) ? '#f59e0b' : 'none'}
          stroke={n <= (rating ?? 0) ? '#f59e0b' : '#cbd5e1'}
        />
      ))}
    </div>
  )
}

export function ReviewsClient({ initialReviews }: { initialReviews: Review[] }) {
  const [tab, setTab] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newReview, setNewReview] = useState({ author: '', rating: 5, content: '' })
  const [loading, setLoading] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return initialReviews.filter((r) => {
      if (tab === 'pending') return !r.approved
      if (tab === 'approved') return r.approved
      if (tab === 'rejected') return !r.approved && r.fetched_at < r.fetched_at // placeholder
      return true
    })
  }, [initialReviews, tab])

  // Better pending = not approved, approved = approved
  const pending = initialReviews.filter((r) => !r.approved)
  const approved = initialReviews.filter((r) => r.approved)

  const displayed = tab === 'pending' ? pending : tab === 'approved' ? approved : []

  const handleApprove = async (id: string) => {
    setLoading(id + '_approve')
    try {
      await approveReview(id)
      toast.success('Recenze schválena')
    } catch {
      toast.error('Nepodařilo se schválit recenzi')
    } finally {
      setLoading(null)
    }
  }

  const handleReject = async (id: string) => {
    setLoading(id + '_reject')
    try {
      await rejectReview(id)
      toast.success('Recenze zamítnuta')
    } catch {
      toast.error('Nepodařilo se zamítnout recenzi')
    } finally {
      setLoading(null)
    }
  }

  const handleDelete = async (id: string) => {
    setLoading(id + '_delete')
    try {
      await deleteReview(id)
      toast.success('Recenze smazána')
      setDeleteConfirm(null)
    } catch {
      toast.error('Nepodařilo se smazat recenzi')
    } finally {
      setLoading(null)
    }
  }

  const handleAddReview = async () => {
    if (!newReview.author || !newReview.content) {
      toast.error('Vyplňte autora a text recenze')
      return
    }
    setLoading('add')
    try {
      await addManualReview(newReview)
      toast.success('Recenze přidána')
      setShowAddModal(false)
      setNewReview({ author: '', rating: 5, content: '' })
    } catch {
      toast.error('Nepodařilo se přidat recenzi')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Recenze (Firmy.cz)
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {pending.length > 0 && (
              <span style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>
                {pending.length} čekají na schválení ·{' '}
              </span>
            )}
            {initialReviews.length} recenzí celkem
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150"
            style={{ border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
          >
            <RefreshCw size={15} />
            Obnovit
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'var(--brand-primary)' }}
          >
            <Plus size={15} />
            Přidat recenzi
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-1 p-1 rounded-xl w-fit"
        style={{ background: 'var(--bg-surface-2)' }}
      >
        {(['pending', 'approved'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="relative px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150"
            style={{
              background: tab === t ? 'var(--bg-surface)' : 'transparent',
              color: tab === t ? 'var(--text-primary)' : 'var(--text-secondary)',
              boxShadow: tab === t ? 'var(--shadow-sm)' : undefined,
            }}
          >
            {TAB_LABELS[t]}
            {t === 'pending' && pending.length > 0 && (
              <span
                className="ml-2 rounded-full px-1.5 py-0.5 text-xs font-bold text-white"
                style={{ background: 'var(--brand-primary)' }}
              >
                {pending.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Review Cards */}
      {displayed.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 rounded-xl gap-3"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
        >
          <Star size={44} style={{ color: 'var(--text-muted)' }} />
          <p style={{ color: 'var(--text-muted)' }}>
            {tab === 'pending' ? 'Žádné recenze čekají na schválení' : 'Žádné schválené recenze'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((review) => (
            <div
              key={review.id}
              className="rounded-xl p-5 flex gap-4"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              {/* Avatar */}
              <div
                className="rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                style={{
                  width: 44,
                  height: 44,
                  background: 'var(--brand-primary-light)',
                  color: 'var(--brand-primary)',
                }}
              >
                {review.author?.charAt(0).toUpperCase() || '?'}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                      {review.author || 'Anonymní'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <StarRating rating={review.rating} />
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {review.source || 'firmy.cz'}
                      </span>
                      {review.published_at && (
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          · {new Date(review.published_at).toLocaleDateString('cs-CZ')}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    {tab === 'pending' && (
                      <button
                        onClick={() => handleApprove(review.id)}
                        disabled={loading === review.id + '_approve'}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 disabled:opacity-60"
                        style={{ background: '#f0fdf4', color: '#16a34a' }}
                      >
                        <CheckCircle size={14} />
                        Schválit
                      </button>
                    )}
                    {tab === 'approved' && (
                      <button
                        onClick={() => handleReject(review.id)}
                        disabled={loading === review.id + '_reject'}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 disabled:opacity-60"
                        style={{ background: '#fffbeb', color: '#d97706' }}
                      >
                        <XCircle size={14} />
                        Zamítnout
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteConfirm(review.id)}
                      className="p-1.5 rounded-lg transition-all duration-150"
                      style={{ color: '#ef4444' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#fef2f2')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                {review.content && (
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {review.content}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Review Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        >
          <div
            className="w-full max-w-md rounded-2xl overflow-hidden animate-fade-in"
            style={{ background: 'var(--bg-surface)', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}
          >
            <div className="px-6 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
              <h2 className="font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
                Přidat recenzi ručně
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  Autor
                </label>
                <input
                  type="text"
                  value={newReview.author}
                  onChange={(e) => setNewReview({ ...newReview, author: e.target.value })}
                  placeholder="Jméno zákazníka"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  Hodnocení
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setNewReview({ ...newReview, rating: n })}
                      className="p-1"
                    >
                      <Star
                        size={24}
                        fill={n <= newReview.rating ? '#f59e0b' : 'none'}
                        stroke={n <= newReview.rating ? '#f59e0b' : '#cbd5e1'}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
                  Text recenze
                </label>
                <textarea
                  value={newReview.content}
                  onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                  placeholder="Text recenze zákazníka..."
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none"
                  style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                >
                  Zrušit
                </button>
                <button
                  onClick={handleAddReview}
                  disabled={loading === 'add'}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                  style={{ background: 'var(--brand-primary)' }}
                >
                  {loading === 'add' ? 'Přidávám...' : 'Přidat'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 animate-fade-in"
            style={{ background: 'var(--bg-surface)', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-full flex items-center justify-center" style={{ width: 44, height: 44, background: '#fef2f2' }}>
                <AlertTriangle size={22} style={{ color: '#ef4444' }} />
              </div>
              <div>
                <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Smazat recenzi?</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Tato akce je nevratná</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              >
                Zrušit
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={!!loading}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                style={{ background: '#ef4444' }}
              >
                {loading ? 'Mažu...' : 'Smazat'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
