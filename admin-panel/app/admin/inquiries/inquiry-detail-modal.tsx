'use client'

import { Filter, ClipboardList, X, ChevronDown, Phone, Mail } from 'lucide-react'
import { inquirySourceLabel } from '@/lib/inquiry-source-label'
import { cleanInquiryMessage, collectInquiryPhotos, type Inquiry } from './inquiry-utils'

/** Detail poptávky: kontakt, zpráva, fotky, změna stavu a interní poznámky. */
export function InquiryDetailModal({
  inquiry,
  notes,
  onNotesChange,
  savingNotes,
  updatingStatus,
  onStatusChange,
  onSaveNotes,
  onClose,
}: {
  inquiry: Inquiry
  notes: string
  onNotesChange: (notes: string) => void
  savingNotes: boolean
  updatingStatus: boolean
  onStatusChange: (status: string) => void
  onSaveNotes: () => void
  onClose: () => void
}) {
  return (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        >
          <div
            className="w-full max-w-2xl rounded-2xl overflow-hidden animate-fade-in"
            style={{
              background: 'var(--bg-surface)',
              boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              className="flex items-start justify-between px-6 py-5"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <div>
                <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {inquiry.name || 'Poptávka'}
                </h2>
                <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {new Date(inquiry.created_at).toLocaleString('cs-CZ')} • {inquirySourceLabel(inquiry.source)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* Status Selector */}
                <div className="relative">
                  <select
                    value={inquiry.status || 'new'}
                    onChange={(e) => onStatusChange(e.target.value)}
                    disabled={updatingStatus}
                    className="pl-3 pr-8 py-2 rounded-lg text-sm font-semibold appearance-none cursor-pointer outline-none"
                    style={{
                      border: '1px solid var(--border)',
                      background: 'var(--bg-base)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <option value="new">Nová</option>
                    <option value="in_progress">V řešení</option>
                    <option value="resolved">Vyřešeno</option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: 'var(--text-muted)' }}
                  />
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface-2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Contact Info */}
              <div
                className="rounded-xl p-4 grid grid-cols-2 gap-4"
                style={{ background: 'var(--bg-base)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center gap-2">
                  <Mail size={16} style={{ color: 'var(--text-muted)' }} />
                  <div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>E-mail</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {inquiry.email || '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={16} style={{ color: 'var(--text-muted)' }} />
                  <div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Telefon</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {inquiry.phone || '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Filter size={16} style={{ color: 'var(--text-muted)' }} />
                  <div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Služba</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {inquiry.service || '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ClipboardList size={16} style={{ color: 'var(--text-muted)' }} />
                  <div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Zdroj</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {inquirySourceLabel(inquiry.source)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Message */}
              {inquiry.message && (() => {
      const cleanMsg = cleanInquiryMessage(inquiry.message)

      return cleanMsg ? (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                      Zpráva
                    </p>
                    <div
                      className="rounded-xl p-4 text-sm leading-relaxed"
                      style={{
                        background: 'var(--bg-base)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {cleanMsg}
                    </div>
                  </div>
                ) : null
              })()}

              {/* Photos Gallery */}
              {(() => {
                const photos = collectInquiryPhotos(inquiry)

      if (photos.length === 0) return null

                return (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        Přiložené fotografie ({photos.length})
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {photos.map((photoUrl, idx) => (
                        <div 
                          key={idx}
                          className="relative w-full h-64 rounded-2xl overflow-hidden border bg-slate-50 flex items-center justify-center p-2 group" 
                          style={{ borderColor: 'var(--border)' }}
                        >
                          <img
                            src={photoUrl}
                            alt={`Přiložená fotografia ${idx + 1}`}
                            className="max-h-full max-w-full object-contain rounded-xl"
                          />
                          <a
                            href={photoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute bottom-3 right-3 bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg backdrop-blur-sm transition-all"
                          >
                            Zvětšit ↗
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}

              {/* Notes */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                  Interní poznámky
                </p>
                <textarea
                  value={notes}
                  onChange={(e) => onNotesChange(e.target.value)}
                  placeholder="Přidejte interní poznámku k poptávce..."
                  rows={4}
                  className="w-full rounded-xl p-4 text-sm outline-none resize-none"
                  style={{
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                    background: 'var(--bg-base)',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--brand-primary)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={onSaveNotes}
                    disabled={savingNotes}
                    className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 disabled:opacity-60"
                    style={{ background: 'var(--brand-primary)', color: 'white' }}
                  >
                    {savingNotes ? 'Ukládám...' : 'Uložit poznámky'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
  )
}
