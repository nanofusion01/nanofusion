'use client'

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'
import {
  ArrowLeft, Save, Upload, Trash2, Eye, EyeOff,
  MapPin, Clock, Wrench, Loader2, ImageIcon, Plus
} from 'lucide-react'
import { updateRealization, togglePublished, uploadRealizationPhoto, deleteRealizationPhoto } from '../actions'

type Realization = {
  id: string
  title: string
  description: string | null
  location: string | null
  duration: string | null
  work_type: string | null
  is_published: boolean
}

type Photo = {
  id: string
  url: string
  caption: string | null
  order_index: number
}

const WORK_TYPES = [
  'Čištění střech', 'Čištění fasád', 'Čištění dlažeb',
  'Solární panely', 'Nano-ochrana', 'Komplexní projekt', 'Graffiti', 'Jiné',
]

export function RealizationDetailClient({
  realization: initial,
  initialPhotos,
}: {
  realization: Realization
  initialPhotos: Photo[]
}) {
  const [r, setR] = useState(initial)
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState<'info' | 'photos'>('info')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateRealization(r.id, {
        title: r.title,
        description: r.description ?? undefined,
        location: r.location ?? undefined,
        duration: r.duration ?? undefined,
        work_type: r.work_type ?? undefined,
      })
      toast.success('Realizace uložena')
    } catch (err: any) {
      toast.error('Chyba: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleTogglePublish = async () => {
    try {
      await togglePublished(r.id, !r.is_published)
      setR({ ...r, is_published: !r.is_published })
      toast.success(r.is_published ? 'Realizace skryta z webu' : 'Realizace zveřejněna')
    } catch (err: any) {
      toast.error('Chyba: ' + err.message)
    }
  }

  const handlePhotoUpload = async (files: FileList) => {
    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData()
        fd.append('file', file)
        const url = await uploadRealizationPhoto(r.id, fd)
        setPhotos(prev => [...prev, {
          id: Math.random().toString(),
          url,
          caption: null,
          order_index: prev.length,
        }])
      }
      toast.success(`${files.length > 1 ? files.length + ' fotek nahráno' : 'Fotka nahrána'}`)
    } catch (err: any) {
      toast.error('Chyba uploadu: ' + err.message)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Smazat tuto fotku?')) return
    try {
      await deleteRealizationPhoto(photoId)
      setPhotos(prev => prev.filter(p => p.id !== photoId))
      toast.success('Fotka smazána')
    } catch (err: any) {
      toast.error('Chyba: ' + err.message)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/realizations"
            className="p-2 rounded-xl border hover:bg-slate-50 transition-colors"
            style={{ borderColor: 'var(--border)' }}
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {r.title}
            </h1>
            <p className="text-sm opacity-60">Detail realizace</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleTogglePublish}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-colors"
            style={{
              borderColor: r.is_published ? '#22c55e' : 'var(--border)',
              color: r.is_published ? '#16a34a' : 'var(--text-secondary)',
              background: r.is_published ? '#f0fdf4' : 'var(--bg-surface)',
            }}
          >
            {r.is_published ? <Eye size={16} /> : <EyeOff size={16} />}
            {r.is_published ? 'Zveřejněno' : 'Koncept'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-amber-500/20 disabled:opacity-50"
            style={{ background: 'var(--brand-primary)' }}
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Ukládám...' : 'Uložit'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 rounded-2xl w-fit" style={{ background: 'var(--bg-surface-2)' }}>
        {[
          { id: 'info', label: 'Základní info' },
          { id: 'photos', label: `Fotografie (${photos.length})` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
            style={{
              background: activeTab === tab.id ? 'var(--bg-surface)' : 'transparent',
              color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              boxShadow: activeTab === tab.id ? 'var(--shadow-sm)' : 'none',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-8 rounded-3xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        {/* INFO TAB */}
        {activeTab === 'info' && (
          <div className="max-w-2xl space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Název realizace</label>
              <input
                type="text"
                value={r.title}
                onChange={e => setR({ ...r, title: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border outline-none text-sm font-semibold"
                style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <MapPin size={12} /> Lokalita
                </label>
                <input
                  type="text"
                  value={r.location || ''}
                  onChange={e => setR({ ...r, location: e.target.value })}
                  placeholder="např. Praha - Západ"
                  className="w-full px-4 py-3 rounded-xl border outline-none text-sm"
                  style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Clock size={12} /> Délka projektu
                </label>
                <input
                  type="text"
                  value={r.duration || ''}
                  onChange={e => setR({ ...r, duration: e.target.value })}
                  placeholder="např. 2 dny"
                  className="w-full px-4 py-3 rounded-xl border outline-none text-sm"
                  style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Wrench size={12} /> Typ práce
              </label>
              <select
                value={r.work_type || ''}
                onChange={e => setR({ ...r, work_type: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border outline-none text-sm"
                style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              >
                <option value="">-- Vyberte typ --</option>
                {WORK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Popis realizace</label>
              <textarea
                value={r.description || ''}
                onChange={e => setR({ ...r, description: e.target.value })}
                rows={7}
                placeholder="Popište výzvu, postup práce a výsledek..."
                className="w-full px-4 py-3 rounded-xl border outline-none resize-none text-sm leading-relaxed"
                style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>
        )}

        {/* PHOTOS TAB */}
        {activeTab === 'photos' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">Fotografie realizace</h3>
                <p className="text-sm opacity-50 mt-1">První fotka se zobrazí jako hlavní na webu</p>
              </div>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={e => { if (e.target.files?.length) handlePhotoUpload(e.target.files) }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                  style={{ background: 'var(--brand-primary)' }}
                >
                  {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  {uploading ? 'Nahrávám...' : 'Nahrát fotky'}
                </button>
              </div>
            </div>

            {photos.length === 0 ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed cursor-pointer hover:bg-slate-50 transition-colors"
                style={{ borderColor: 'var(--border)' }}
              >
                <ImageIcon size={40} className="opacity-20 mb-3" />
                <p className="font-bold text-sm opacity-40">Žádné fotky. Klikněte pro nahrání.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo, i) => (
                  <div
                    key={photo.id}
                    className="relative group rounded-2xl overflow-hidden border"
                    style={{ aspectRatio: '4/3', borderColor: i === 0 ? 'var(--brand-primary)' : 'var(--border)', borderWidth: i === 0 ? 2 : 1 }}
                  >
                    {i === 0 && (
                      <span className="absolute top-2 left-2 z-10 text-[10px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-full uppercase">
                        Hlavní
                      </span>
                    )}
                    <img src={photo.url} className="w-full h-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
                {/* Add more button */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed cursor-pointer hover:bg-slate-50 transition-colors"
                  style={{ aspectRatio: '4/3', borderColor: 'var(--border)' }}
                >
                  <Plus size={24} className="opacity-30" />
                  <span className="text-xs font-bold opacity-30 mt-1">Přidat</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
