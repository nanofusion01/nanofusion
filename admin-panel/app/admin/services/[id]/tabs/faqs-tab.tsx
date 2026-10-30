'use client'

import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import { unwrapActions } from '@/lib/action-result'
import * as actionsRaw from '../../actions'
import * as faqActionsRaw from '../../../faqs/actions'
import type { ServiceFAQ } from '../types'

const { addServiceFaq, updateServiceFaq, deleteServiceFaq } = unwrapActions(actionsRaw)
const { updateFaq, deleteFaq } = unwrapActions(faqActionsRaw)

/** Záložka „Q&A“: časté dotazy ke službě (vlastní i obecné ze sekce FAQ). */
export function FaqsTab({
  serviceId,
  faqs,
  setFaqs,
}: {
  serviceId: string
  faqs: ServiceFAQ[]
  setFaqs: React.Dispatch<React.SetStateAction<ServiceFAQ[]>>
}) {
  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">Q&A / Časté dotazy k této službě</h3>
          <button
            onClick={async () => {
              const newFaq = await addServiceFaq(serviceId, 'Nová otázka', 'Odpověď...')
              setFaqs([...faqs, newFaq])
              toast.success('Dotaz přidán')
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
            style={{ background: 'var(--brand-primary)' }}
          >
            <Plus size={16} /> Přidat dotaz
          </button>
        </div>

        <div className="grid gap-4">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className="p-6 rounded-2xl border space-y-4"
              style={{ background: 'var(--bg-base)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-start gap-4">
                <div className="flex-1 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400 flex items-center justify-between">
                      <span>Otázka</span>
                      {faq.is_global && (
                        <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[9px] font-black tracking-tighter">
                          GLOBÁLNÍ
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) => {
                        const val = e.target.value
                        setFaqs((prev) => prev.map((f) => (f.id === faq.id ? { ...f, question: val } : f)))
                      }}
                      onBlur={async (e) => {
                        if (faq.is_global) {
                          await updateFaq(faq.id, { question: e.target.value })
                        } else {
                          await updateServiceFaq(faq.id, { question: e.target.value })
                        }
                      }}
                      className="w-full px-4 py-2 rounded-lg border font-bold text-sm outline-none focus:border-amber-500"
                      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400">Pořadí</label>
                      <input
                        type="number"
                        value={faq.order_index || 0}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0
                          setFaqs((prev) => prev.map((f) => (f.id === faq.id ? { ...f, order_index: val } : f)))
                        }}
                        onBlur={async (e) => {
                          const val = parseInt(e.target.value) || 0
                          await updateServiceFaq(faq.id, { order_index: val })
                          // Seřadíme lokálně po změně
                          setFaqs((prev) => [...prev].sort((a, b) => (a.order_index || 0) - (b.order_index || 0)))
                        }}
                        className="w-full px-4 py-2 rounded-lg border text-sm outline-none focus:border-amber-500"
                        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400">Odpověď</label>
                      <textarea
                        value={faq.answer}
                        onChange={(e) => {
                          const val = e.target.value
                          setFaqs((prev) => prev.map((f) => (f.id === faq.id ? { ...f, answer: val } : f)))
                        }}
                        onBlur={async (e) => {
                          if (faq.is_global) {
                            await updateFaq(faq.id, { answer: e.target.value })
                          } else {
                            await updateServiceFaq(faq.id, { answer: e.target.value })
                          }
                        }}
                        className="w-full px-4 py-2 rounded-lg border text-sm outline-none focus:border-amber-500 resize-none"
                        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 pt-6">
                  <button
                    onClick={async () => {
                      if (confirm('Smazat tento dotaz?')) {
                        if (faq.is_global) {
                          await deleteFaq(faq.id)
                        } else {
                          await deleteServiceFaq(faq.id)
                        }
                        setFaqs(faqs.filter((f) => f.id !== faq.id))
                        toast.success('Dotaz smazán')
                      }
                    }}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button
                    onClick={async () => {
                      const newStatus = !faq.is_active
                      if (faq.is_global) {
                        await updateFaq(faq.id, { is_active: newStatus })
                      } else {
                        await updateServiceFaq(faq.id, { is_active: newStatus })
                      }
                      setFaqs((prev) => prev.map((f) => (f.id === faq.id ? { ...f, is_active: newStatus } : f)))
                      toast.success(newStatus ? 'Aktivováno' : 'Deaktivováno')
                    }}
                    title={faq.is_active ? 'Skrýt z webu' : 'Zobrazit na webu'}
                    className={`p-2 rounded-lg transition-colors text-xs font-bold ${faq.is_active ? 'text-green-600 bg-green-50' : 'text-slate-400 bg-slate-100'}`}
                  >
                    {faq.is_active ? '✓' : '○'}
                  </button>
                </div>
              </div>
            </div>
          ))}
          {faqs.length === 0 && (
            <div className="text-center py-12 opacity-40 text-sm border-2 border-dashed rounded-2xl">
              Zatím žádné dotazy. Klikněte na „Přidat dotaz“.
            </div>
          )}
        </div>
      </div>
    </>
  )
}
