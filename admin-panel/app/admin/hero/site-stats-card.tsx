'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { BarChart3, Save } from 'lucide-react'
import { errorMessage } from '@/lib/utils'
import { unwrapActions } from '@/lib/action-result'
import { SITE_STATS_FIELDS } from '@/lib/site-stats'
import * as actionsRaw from './actions'

const { updateSiteStats } = unwrapActions(actionsRaw)

/** Čísla na webu: úvodní sekce, štítky v hero, hodnocení u recenzí a stránky služeb. */
export function SiteStatsCard({ initialValues }: { initialValues: Record<string, string> }) {
  const [values, setValues] = useState(initialValues)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateSiteStats(values)
      toast.success('Čísla na webu byla uložena')
    } catch (e) {
      toast.error('Chyba při ukládání: ' + errorMessage(e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="rounded-2xl p-6 shadow-sm border"
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
          <BarChart3 size={20} />
        </div>
        <h2 className="text-lg font-bold">Čísla na webu</h2>
      </div>
      <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
        Zobrazují se v úvodní sekci, u recenzí a na stránkách služeb. Udržujte je aktuální a doložitelné.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {SITE_STATS_FIELDS.map((field) => (
          <div key={field.key}>
            <label htmlFor={`stat-${field.key}`} className="text-xs font-bold uppercase text-slate-400 mb-1.5 block">
              {field.label}
            </label>
            <input
              id={`stat-${field.key}`}
              value={values[field.key] ?? ''}
              placeholder={field.default}
              maxLength={30}
              onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-amber-500/20 outline-none font-medium"
              style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 transition-all disabled:opacity-50"
        >
          <Save size={18} />
          {saving ? 'Ukládám...' : 'Uložit čísla'}
        </button>
      </div>
    </div>
  )
}
