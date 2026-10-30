'use client'

import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Search, Download, Trash2, AlertTriangle } from 'lucide-react'
import * as actionsRaw from './actions'
import { unwrapActions } from '@/lib/action-result'
import { inquiriesToCsv, STATUS_LABELS, type Inquiry } from './inquiry-utils'
import { InquiriesTable } from './inquiries-table'
import { InquiryDetailModal } from './inquiry-detail-modal'

const { updateInquiryStatus, updateInquiryNotes, deleteInquiry, deleteInquiries, deleteAllInquiries } =
  unwrapActions(actionsRaw)

interface InquiriesClientProps {
  initialInquiries: Inquiry[]
}

export function InquiriesClient({ initialInquiries }: InquiriesClientProps) {
  const [inquiries, setInquiries] = useState<Inquiry[]>(initialInquiries)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [notes, setNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteAllConfirm, setDeleteAllConfirm] = useState(false)
  const [deletingAll, setDeletingAll] = useState(false)
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false)
  const [bulkDeleting, setBulkDeleting] = useState(false)

  const filtered = useMemo(() => {
    return inquiries.filter((inq) => {
      const matchSearch =
        !search ||
        [inq.name, inq.email, inq.phone, inq.service, inq.message]
          .filter(Boolean)
          .some((field) => field!.toLowerCase().includes(search.toLowerCase()))
      const matchStatus = statusFilter === 'all' || inq.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [inquiries, search, statusFilter])

  const toggleChecked = (id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const allFilteredChecked = filtered.length > 0 && filtered.every((inq) => checkedIds.has(inq.id))

  const toggleCheckAllFiltered = () => {
    setCheckedIds((prev) => {
      if (allFilteredChecked) {
        const next = new Set(prev)
        filtered.forEach((inq) => next.delete(inq.id))
        return next
      }
      const next = new Set(prev)
      filtered.forEach((inq) => next.add(inq.id))
      return next
    })
  }

  const handleDeleteSelected = async () => {
    setBulkDeleting(true)
    try {
      await deleteInquiries(Array.from(checkedIds))
      toast.success(`Smazáno ${checkedIds.size} poptávek`)
      window.location.reload()
    } catch {
      toast.error('Nepodařilo se smazat vybrané poptávky')
      setBulkDeleting(false)
      setBulkDeleteConfirm(false)
    }
  }

  const handleDeleteAll = async () => {
    setDeletingAll(true)
    try {
      await deleteAllInquiries()
      toast.success('Všechny poptávky smazány')
      window.location.reload()
    } catch {
      toast.error('Nepodařilo se smazat poptávky')
      setDeletingAll(false)
      setDeleteAllConfirm(false)
    }
  }

  const handleExportCSV = () => {
    const csv = inquiriesToCsv(filtered)
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `poptavky-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('CSV exportováno')
  }

  const handleOpenInquiry = (inq: Inquiry) => {
    setSelectedInquiry(inq)
    setNotes(inq.notes || '')
  }

  const handleStatusChange = async (id: string, status: string) => {
    setUpdatingStatus(true)
    try {
      await updateInquiryStatus(id, status, selectedInquiry?.source || undefined)
      toast.success('Stav poptávky byl aktualizován')
      setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)))
      if (selectedInquiry?.id === id) {
        setSelectedInquiry({ ...selectedInquiry, status })
      }
    } catch {
      toast.error('Nepodařilo se aktualizovat stav')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleSaveNotes = async () => {
    if (!selectedInquiry) return
    setSavingNotes(true)
    try {
      await updateInquiryNotes(selectedInquiry.id, notes, selectedInquiry.source || undefined)
      setInquiries((prev) => prev.map((i) => (i.id === selectedInquiry.id ? { ...i, notes } : i)))
      toast.success('Poznámky byly uloženy')
    } catch {
      toast.error('Nepodařilo se uložit poznámky')
    } finally {
      setSavingNotes(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeleting(true)
    const inq = inquiries.find((i) => i.id === id)
    try {
      await deleteInquiry(id, inq?.source || undefined)
      toast.success('Poptávka byla smazána')
      setInquiries((prev) => prev.filter((i) => i.id !== id))
      setDeleteConfirm(null)
      if (selectedInquiry?.id === id) setSelectedInquiry(null)
    } catch {
      toast.error('Nepodařilo se smazat poptávku')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Správa poptávek
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {inquiries.length} poptávek celkem
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150"
            style={{
              border: '1px solid var(--border)',
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--brand-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            <Download size={16} />
            Exportovat CSV
          </button>

          {inquiries.length > 0 &&
            (!deleteAllConfirm ? (
              <button
                onClick={() => setDeleteAllConfirm(true)}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold"
                style={{ color: '#ef4444', background: '#fef2f2' }}
              >
                <Trash2 size={14} /> Vymazat vše
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs px-3 py-2.5 rounded-xl" style={{ background: '#fef2f2' }}>
                <span style={{ color: '#991b1b' }}>Nevratně smazat všech {inquiries.length} poptávek?</span>
                <button
                  onClick={handleDeleteAll}
                  disabled={deletingAll}
                  className="font-bold disabled:opacity-60"
                  style={{ color: '#ef4444' }}
                >
                  {deletingAll ? 'Mažu...' : 'Ano, smazat'}
                </button>
                <button
                  onClick={() => setDeleteAllConfirm(false)}
                  disabled={deletingAll}
                  style={{ color: 'var(--text-muted)' }}
                >
                  Zrušit
                </button>
              </div>
            ))}
        </div>
      </div>

      {/* Filters */}
      <div
        className="rounded-xl p-4 flex flex-wrap gap-3"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
      >
        {/* Search */}
        <div className="flex-1 relative min-w-[200px]">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            placeholder="Hledat podle jména, e-mailu, služby..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm outline-none"
            style={{
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2">
          {['all', 'new', 'in_progress', 'resolved'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150"
              style={{
                background: statusFilter === status ? 'var(--brand-primary)' : 'var(--bg-surface-2)',
                color: statusFilter === status ? 'white' : 'var(--text-secondary)',
                border: '1px solid transparent',
              }}
            >
              {status === 'all' ? 'Vše' : STATUS_LABELS[status]}
            </button>
          ))}
        </div>
      </div>

      {/* Selection toolbar - jen když je něco zaškrtnuté */}
      {checkedIds.size > 0 && (
        <div
          className="rounded-xl px-4 py-3 flex items-center justify-between gap-3 flex-wrap"
          style={{ background: '#fef2f2', border: '1px solid #fecaca' }}
        >
          <span className="text-sm font-semibold" style={{ color: '#991b1b' }}>
            Vybráno {checkedIds.size}{' '}
            {checkedIds.size === 1 ? 'poptávka' : checkedIds.size < 5 ? 'poptávky' : 'poptávek'}
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
                <span className="text-xs" style={{ color: '#991b1b' }}>
                  Opravdu smazat?
                </span>
                <button
                  onClick={handleDeleteSelected}
                  disabled={bulkDeleting}
                  className="font-bold text-xs disabled:opacity-60"
                  style={{ color: '#ef4444' }}
                >
                  {bulkDeleting ? 'Mažu...' : 'Ano, smazat'}
                </button>
                <button
                  onClick={() => setBulkDeleteConfirm(false)}
                  disabled={bulkDeleting}
                  className="text-xs"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Zrušit
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <InquiriesTable
        filtered={filtered}
        search={search}
        checkedIds={checkedIds}
        allFilteredChecked={allFilteredChecked}
        onClearSearch={() => setSearch('')}
        onToggle={toggleChecked}
        onToggleAll={toggleCheckAllFiltered}
        onOpen={handleOpenInquiry}
        onDelete={setDeleteConfirm}
      />

      {/* Detail Modal */}
      {selectedInquiry && (
        <InquiryDetailModal
          inquiry={selectedInquiry}
          notes={notes}
          onNotesChange={setNotes}
          savingNotes={savingNotes}
          updatingStatus={updatingStatus}
          onStatusChange={(status) => handleStatusChange(selectedInquiry.id, status)}
          onSaveNotes={handleSaveNotes}
          onClose={() => setSelectedInquiry(null)}
        />
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 animate-fade-in"
            style={{
              background: 'var(--bg-surface)',
              boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="rounded-full flex items-center justify-center"
                style={{ width: 44, height: 44, background: '#fef2f2' }}
              >
                <AlertTriangle size={22} style={{ color: '#ef4444' }} />
              </div>
              <div>
                <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                  Smazat poptávku?
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Tato akce je nevratná
                </p>
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
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                style={{ background: '#ef4444' }}
              >
                {deleting ? 'Mažu...' : 'Smazat'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
