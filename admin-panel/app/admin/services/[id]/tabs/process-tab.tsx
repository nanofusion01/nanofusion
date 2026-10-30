'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Save, Plus, Trash2 } from 'lucide-react'
import { errorMessage } from '@/lib/utils'
import { unwrapActions } from '@/lib/action-result'
import * as actionsRaw from '../../actions'
import type { ProcessStep } from '../types'

const { saveServiceProcessSteps } = unwrapActions(actionsRaw)

/** Záložka „Jak to funguje“: kroky postupu práce u služby. */
export function ProcessTab({ serviceId, processSteps, setProcessSteps }: { serviceId: string; processSteps: ProcessStep[]; setProcessSteps: React.Dispatch<React.SetStateAction<ProcessStep[]>> }) {
  const [savingProcess, setSavingProcess] = useState(false)
  // --- Process steps save ---
  const handleSaveProcess = async () => {
    setSavingProcess(true)
    try {
      await saveServiceProcessSteps(serviceId, processSteps)
      toast.success('Postup krok za krokem uložen')
    } catch (err) {
      toast.error('Chyba uložení postupu: ' + errorMessage(err))
    } finally {
      setSavingProcess(false)
    }
  }

  return (
    <>
      <div className="max-w-4xl space-y-6">
        <div className="flex justify-between items-center pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div>
            <h3 className="text-lg font-bold">Jak to funguje (Krok za krokem)</h3>
            <p className="text-sm text-slate-400">Upravte specifický postup a jednotlivé kroky realizace pro tuto službu.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                const nextNum = (processSteps.length + 1).toString().padStart(2, '0')
                setProcessSteps([...processSteps, { step: nextNum, title: 'Nový krok', desc: 'Popis nového kroku' }])
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-all"
            >
              <Plus size={16} /> Přidat krok
            </button>
            <button
              onClick={handleSaveProcess}
              disabled={savingProcess}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white shadow-lg shadow-amber-500/20"
              style={{ background: 'var(--brand-primary)' }}
            >
              <Save size={16} />
              {savingProcess ? 'Ukládám...' : 'Uložit postup'}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {processSteps.map((stepItem, idx) => (
            <div 
              key={idx} 
              className="p-5 rounded-2xl border space-y-4 relative"
              style={{ background: 'var(--bg-base)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full max-w-xs">
                  <span className="text-xs font-bold uppercase text-slate-400">Číslo kroku:</span>
                  <input
                    type="text"
                    value={stepItem.step}
                    onChange={(e) => {
                      const updated = [...processSteps]
                      updated[idx].step = e.target.value
                      setProcessSteps(updated)
                    }}
                    className="w-20 px-3 py-1.5 rounded-lg border text-center font-bold text-amber-500"
                    style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  {idx > 0 && (
                    <button
                      onClick={() => {
                        const updated = [...processSteps]
                        const temp = updated[idx - 1]
                        updated[idx - 1] = updated[idx]
                        updated[idx] = temp
                        setProcessSteps(updated)
                      }}
                      className="px-2.5 py-1 text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      title="Posunout nahoru"
                    >
                      ↑ Nahoru
                    </button>
                  )}
                  {idx < processSteps.length - 1 && (
                    <button
                      onClick={() => {
                        const updated = [...processSteps]
                        const temp = updated[idx + 1]
                        updated[idx + 1] = updated[idx]
                        updated[idx] = temp
                        setProcessSteps(updated)
                      }}
                      className="px-2.5 py-1 text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      title="Posunout dolů"
                    >
                      ↓ Dolů
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setProcessSteps(processSteps.filter((_, i) => i !== idx))
                    }}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Smazat krok"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-400">Název kroku</label>
                <input
                  type="text"
                  value={stepItem.title}
                  onChange={(e) => {
                    const updated = [...processSteps]
                    updated[idx].title = e.target.value
                    setProcessSteps(updated)
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border outline-none font-bold"
                  style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-400">Popis kroku</label>
                <textarea
                  rows={2}
                  value={stepItem.desc}
                  onChange={(e) => {
                    const updated = [...processSteps]
                    updated[idx].desc = e.target.value
                    setProcessSteps(updated)
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border outline-none text-sm"
                  style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
