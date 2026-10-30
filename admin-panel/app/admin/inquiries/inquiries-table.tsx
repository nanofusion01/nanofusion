'use client'

import { ClipboardList, ChevronRight, Phone, Mail, Trash2 } from 'lucide-react'
import { inquirySourceLabel } from '@/lib/inquiry-source-label'
import { STATUS_COLORS, STATUS_LABELS, inquiryArea, type Inquiry } from './inquiry-utils'

/** Seznam poptávek: tabulka na počítači, karty na mobilu. */
export function InquiriesTable({
  filtered,
  search,
  checkedIds,
  allFilteredChecked,
  onClearSearch,
  onToggle,
  onToggleAll,
  onOpen,
  onDelete,
}: {
  filtered: Inquiry[]
  search: string
  checkedIds: Set<string>
  allFilteredChecked: boolean
  onClearSearch: () => void
  onToggle: (id: string) => void
  onToggleAll: () => void
  onOpen: (inquiry: Inquiry) => void
  onDelete: (id: string) => void
}) {
  return (
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: filtered.length > 0 ? '1px solid var(--border)' : 'none' }}
      >
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-xl border border-dashed">
            <ClipboardList size={44} style={{ color: 'var(--text-muted)' }} />
            <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>
              Žádné poptávky nenalezeny
            </p>
            {search && (
              <button
                onClick={onClearSearch}
                className="text-sm"
                style={{ color: 'var(--brand-primary)' }}
              >
                Vymazat hledání
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto bg-white">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-base)' }}>
                  <th className="px-5 py-3" style={{ width: 20 }}>
                    <input
                      type="checkbox"
                      checked={allFilteredChecked}
                      onChange={onToggleAll}
                      className="cursor-pointer"
                    />
                  </th>
                  {['Datum', 'Klient', 'Služba', 'Plocha', 'Zdroj', 'Stav', 'Akce'].map((col) => (
                    <th
                      key={col}
                      className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((inq, i) => {
                  const st = inq.status as string
                  const colors = STATUS_COLORS[st] || STATUS_COLORS['new']
                  return (
                    <tr
                      key={inq.id}
                      className="transition-colors duration-100"
                      style={{
                        borderBottom:
                          i < filtered.length - 1
                            ? '1px solid var(--border)'
                            : undefined,
                        cursor: 'pointer',
                      }}
                      onClick={() => onOpen(inq)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--bg-base)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = ''
                      }}
                    >
                      <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={checkedIds.has(inq.id)}
                          onChange={() => onToggle(inq.id)}
                          className="cursor-pointer"
                        />
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                          {new Date(inq.created_at).toLocaleDateString('cs-CZ')}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {inq.name || '—'}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {inq.email || inq.phone || ''}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {inq.service || '—'}
                      </td>
                      <td className="px-5 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {inquiryArea(inq.message) || '—'} m²
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-medium px-2 py-1 rounded-md bg-slate-100 text-slate-600">
                             {inquirySourceLabel(inq.source)}
                          </span>
                          {inq.original_photo_url && (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 flex items-center gap-1">
                              📷 Foto
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{ background: colors.bg, color: colors.text }}
                        >
                          {STATUS_LABELS[st] || st}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div
                          className="flex gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => onOpen(inq)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
                            style={{
                              background: 'var(--brand-primary)',
                              color: 'white',
                            }}
                          >
                            Detail
                          </button>
                          <button
                            onClick={() => onDelete(inq.id)}
                            className="p-1.5 rounded-lg transition-all duration-150"
                            style={{ color: '#ef4444' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#fef2f2'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = ''
                            }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden flex flex-col gap-3">
            {filtered.map((inq) => {
              const st = inq.status as string
              const colors = STATUS_COLORS[st] || STATUS_COLORS['new']
              return (
                <div 
                  key={inq.id}
                  onClick={() => onOpen(inq)}
                  className="p-4 rounded-xl space-y-3 bg-white shadow-sm border border-slate-100"
                  style={{ borderLeft: `4px solid ${colors.text}` }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={checkedIds.has(inq.id)}
                        onChange={() => onToggle(inq.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="cursor-pointer"
                      />
                      <span className="text-[10px] font-bold uppercase text-slate-400">
                        {new Date(inq.created_at).toLocaleDateString('cs-CZ')}
                      </span>
                    </div>
                    <span
                      className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider"
                      style={{ background: colors.bg, color: colors.text }}
                    >
                      {STATUS_LABELS[st] || st}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{inq.name || 'Bez jména'}</h3>
                    <p className="text-xs text-slate-500">{inq.service || 'Obecná poptávka'}</p>
                  </div>
                  <div className="pt-2 flex justify-between items-center border-t border-slate-50">
                    <div className="flex gap-2">
                       {inq.phone && <Phone size={14} className="text-slate-400" />}
                       {inq.email && <Mail size={14} className="text-slate-400" />}
                    </div>
                    <ChevronRight size={16} className="text-slate-300" />
                  </div>
                </div>
              )
            })}
          </div>
          </>
        )}
      </div>
  )
}
