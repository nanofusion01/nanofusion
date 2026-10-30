'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import { errorMessage } from '@/lib/utils'
import { unwrapActions } from '@/lib/action-result'
import * as actionsRaw from '../../actions'
import type { ServiceReview, ExternalReview } from '../types'

const { addServiceReview, deleteServiceReview } = unwrapActions(actionsRaw)

/** Záložka „Vybrané recenze“: recenze zobrazené na stránce služby. */
export function ReviewsTab({
  serviceId,
  serviceReviews,
  setServiceReviews,
  externalReviews,
}: {
  serviceId: string
  serviceReviews: ServiceReview[]
  setServiceReviews: React.Dispatch<React.SetStateAction<ServiceReview[]>>
  externalReviews: ExternalReview[]
}) {
  const [showAddReview, setShowAddReview] = useState(false)
  const [addingReview, setAddingReview] = useState(false)
  const [revAuthor, setRevAuthor] = useState('')
  const [revRating, setRevRating] = useState(5)
  const [revContent, setRevContent] = useState('')
  const [revSource, setRevSource] = useState('manual')

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Vybrané recenze k této službě
            </h2>
            <p className="text-sm opacity-60">Recenze, které se budou zobrazovat na detailu této služby.</p>
          </div>
          <button
            onClick={() => setShowAddReview(!showAddReview)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white block"
            style={{ background: 'var(--brand-primary)' }}
          >
            <Plus size={16} />
            Přidat recenzi
          </button>
        </div>

        {showAddReview && (
          <div
            className="p-6 rounded-2xl border space-y-4 max-w-xl"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-surface-2)' }}
          >
            <h3 className="font-bold text-sm">Nová recenze</h3>

            {/* Dropdown for selecting existing approved review */}
            {externalReviews.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Kopírovat z existujících recenzí
                </label>
                <select
                  onChange={(e) => {
                    const selected = externalReviews.find((r) => r.id === e.target.value)
                    if (selected) {
                      setRevAuthor(selected.author || '')
                      setRevRating(selected.rating || 5)
                      setRevContent(selected.content || '')
                      setRevSource(selected.source || 'manual')
                    }
                  }}
                  defaultValue=""
                  className="w-full px-3 py-2.5 rounded-xl border outline-none text-sm"
                  style={{ background: 'var(--bg-base)', borderColor: 'var(--border)' }}
                >
                  <option value="" disabled>
                    -- Vyberte recenzi pro automatické vyplnění --
                  </option>
                  {externalReviews.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.author} ({r.source}) - {r.content?.substring(0, 60)}...
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Autor / Jméno</label>
                <input
                  type="text"
                  value={revAuthor}
                  onChange={(e) => setRevAuthor(e.target.value)}
                  placeholder="např. Jan Novák"
                  className="w-full px-3 py-2.5 rounded-xl border outline-none text-sm"
                  style={{ background: 'var(--bg-base)', borderColor: 'var(--border)' }}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Hodnocení (1-5)
                </label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={revRating}
                  onChange={(e) => setRevRating(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border outline-none text-sm"
                  style={{ background: 'var(--bg-base)', borderColor: 'var(--border)' }}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Odkud recenze je
                </label>
                <select
                  value={revSource}
                  onChange={(e) => setRevSource(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border outline-none text-sm"
                  style={{ background: 'var(--bg-base)', borderColor: 'var(--border)' }}
                >
                  <option value="google">Google</option>
                  <option value="firmy.cz">Firmy.cz</option>
                  <option value="manual">Přidáno ručně (bez zdroje)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Obsah recenze</label>
              <textarea
                value={revContent}
                onChange={(e) => setRevContent(e.target.value)}
                rows={4}
                placeholder="Sem vepište obsah recenze..."
                className="w-full px-3 py-2.5 rounded-xl border outline-none text-sm"
                style={{ background: 'var(--bg-base)', borderColor: 'var(--border)' }}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setShowAddReview(false)
                  setRevAuthor('')
                  setRevContent('')
                  setRevSource('manual')
                }}
                className="px-4 py-2 rounded-xl text-sm border hover:bg-slate-50 transition-colors"
              >
                Zrušit
              </button>
              <button
                onClick={async () => {
                  if (!revAuthor || !revContent) {
                    toast.error('Vyplňte autora a obsah recenze')
                    return
                  }
                  setAddingReview(true)
                  try {
                    const newRev = await addServiceReview(serviceId, revAuthor, revRating, revContent, revSource)
                    setServiceReviews((prev) => [newRev, ...prev])
                    setShowAddReview(false)
                    setRevAuthor('')
                    setRevContent('')
                    setRevSource('manual')
                    toast.success('Recenze přidána')
                  } catch (err) {
                    toast.error('Chyba: ' + errorMessage(err))
                  } finally {
                    setAddingReview(false)
                  }
                }}
                disabled={addingReview}
                className="px-4 py-2 rounded-xl text-sm font-bold text-white"
                style={{ background: 'var(--brand-primary)' }}
              >
                {addingReview ? 'Ukládám...' : 'Přidat'}
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {serviceReviews.map((rev) => (
            <div key={rev.id} className="p-6 rounded-2xl border" style={{ borderColor: 'var(--border)' }}>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex gap-1 text-amber-500 font-bold">
                    {'★'.repeat(rev.rating || 5)}
                    {'☆'.repeat(5 - (rev.rating || 5))}
                  </div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold">{rev.author}</h4>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                      {rev.source === 'google' ? 'Google' : rev.source === 'firmy.cz' ? 'Firmy.cz' : 'Ručně přidáno'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">{new Date(rev.created_at).toLocaleDateString('cs')}</p>
                  <p className="pt-2 text-slate-700 max-w-2xl text-sm leading-relaxed">„{rev.content}“</p>
                </div>
                <button
                  onClick={async () => {
                    if (confirm('Smazat tuto recenzi?')) {
                      await deleteServiceReview(rev.id, serviceId)
                      setServiceReviews((prev) => prev.filter((r) => r.id !== rev.id))
                      toast.success('Recenze smazána')
                    }
                  }}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}

          {serviceReviews.length === 0 && (
            <div className="text-center py-12 opacity-40 text-sm border-2 border-dashed rounded-2xl">
              Zatím žádné recenze. Přidejte první nebo zkopírujte z existujících.
            </div>
          )}
        </div>
      </div>
    </>
  )
}
