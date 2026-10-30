'use client'

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2, Upload, Loader2, X } from 'lucide-react'
import { compressImage, errorMessage } from '@/lib/utils'
import { unwrapActions } from '@/lib/action-result'
import * as actionsRaw from '../../actions'
import type { BeforeAfter, GalleryPhoto } from '../types'

const { uploadServiceFile, addBeforeAfter, deleteBeforeAfter, uploadGalleryPhoto, deleteGalleryPhoto } = unwrapActions(actionsRaw)

/** Záložka „Fotky“: srovnání před/po a galerie z realizací. */
export function PhotosTab({ serviceId, beforeAfterItems, setBeforeAfterItems, galleryPhotos, setGalleryPhotos }: { serviceId: string; beforeAfterItems: BeforeAfter[]; setBeforeAfterItems: React.Dispatch<React.SetStateAction<BeforeAfter[]>>; galleryPhotos: GalleryPhoto[]; setGalleryPhotos: React.Dispatch<React.SetStateAction<GalleryPhoto[]>> }) {
  const [showAddBeforeAfter, setShowAddBeforeAfter] = useState(false)
  const [addingBeforeAfter, setAddingBeforeAfter] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const beforeFileRef = useRef<HTMLInputElement>(null)
  const afterFileRef = useRef<HTMLInputElement>(null)
  const galleryFileRef = useRef<HTMLInputElement>(null)
  const [baCaption, setBaCaption] = useState('')
  // --- Before/After upload ---
  const handleAddBeforeAfter = async () => {
    const beforeFile = beforeFileRef.current?.files?.[0]
    const afterFile = afterFileRef.current?.files?.[0]
    if (!beforeFile || !afterFile) {
      toast.error('Vyberte obě fotky (před a po)')
      return
    }
    setAddingBeforeAfter(true)
    try {
      // Nahráváme fotky postupně a s kompresí kvůli Vercel limitu na velikost payloadu (4.5MB)
      toast.info('Komprimuji a nahrávám fotku PŘED...')
      const compressedBefore = await compressImage(beforeFile)
      const fdBefore = new FormData()
      fdBefore.append('file', compressedBefore)
      const beforeUrl = await uploadServiceFile(serviceId, fdBefore)

      toast.info('Komprimuji a nahrávám fotku PO...')
      const compressedAfter = await compressImage(afterFile)
      const fdAfter = new FormData()
      fdAfter.append('file', compressedAfter)
      const afterUrl = await uploadServiceFile(serviceId, fdAfter)

      toast.info('Ukládám záznam...')
      const newItem = await addBeforeAfter(serviceId, beforeUrl, afterUrl, baCaption)

      setBeforeAfterItems(prev => [...prev, newItem])
      setShowAddBeforeAfter(false)
      setBaCaption('')
      if (beforeFileRef.current) beforeFileRef.current.value = ''
      if (afterFileRef.current) afterFileRef.current.value = ''
      toast.success('Srovnání přidáno')
    } catch (err) {
      toast.error('Chyba: ' + errorMessage(err))
    } finally {
      setAddingBeforeAfter(false)
    }
  }
  const handleDeleteBeforeAfter = async (id: string) => {
    if (!confirm('Smazat toto srovnání?')) return
    try {
      await deleteBeforeAfter(id, serviceId)
      setBeforeAfterItems(prev => prev.filter(i => i.id !== id))
      toast.success('Srovnání smazáno')
    } catch (err) {
      toast.error('Chyba: ' + errorMessage(err))
    }
  }
  // --- Gallery ("Z realizací") upload ---
  const handleAddGalleryPhotos = async (files: FileList) => {
    setUploadingGallery(true)
    try {
      for (const file of Array.from(files)) {
        const compressed = await compressImage(file)
        const fd = new FormData()
        fd.append('file', compressed)
        const newItem = await uploadGalleryPhoto(serviceId, fd)
        setGalleryPhotos(prev => [...prev, newItem])
      }
      toast.success('Fotky do galerie nahrány')
    } catch (err) {
      toast.error('Chyba uploadu: ' + errorMessage(err))
    } finally {
      setUploadingGallery(false)
      if (galleryFileRef.current) galleryFileRef.current.value = ''
    }
  }
  const handleDeleteGalleryPhoto = async (id: string) => {
    if (!confirm('Smazat tuto fotku z galerie?')) return
    try {
      await deleteGalleryPhoto(id, serviceId)
      setGalleryPhotos(prev => prev.filter(i => i.id !== id))
      toast.success('Fotka smazána')
    } catch (err) {
      toast.error('Chyba: ' + errorMessage(err))
    }
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">Před & Po srovnání</h3>
          <button
            onClick={() => setShowAddBeforeAfter(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
            style={{ background: 'var(--brand-primary)' }}
          >
            <Plus size={16} /> Přidat srovnání
          </button>
        </div>

        {/* Add Before/After form */}
        {showAddBeforeAfter && (
          <div className="p-6 rounded-2xl border-2 space-y-4" style={{ borderColor: 'var(--brand-primary)', background: 'var(--bg-base)' }}>
            <div className="flex items-center justify-between">
              <h4 className="font-bold">Nahrát nové srovnání</h4>
              <button onClick={() => setShowAddBeforeAfter(false)} className="p-1 rounded-lg hover:bg-slate-100">
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-400">Fotka PŘED</label>
                <input ref={beforeFileRef} type="file" accept="image/*" className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-bold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-400">Fotka PO</label>
                <input ref={afterFileRef} type="file" accept="image/*" className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-bold file:bg-green-50 file:text-green-700 hover:file:bg-green-100" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-400">Popisek (volitelný)</label>
              <input
                type="text"
                value={baCaption}
                onChange={(e) => setBaCaption(e.target.value)}
                placeholder="např. Fasáda před a po nano-ochraně"
                className="w-full px-4 py-2 rounded-xl border outline-none text-sm"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
              />
            </div>
            <button
              onClick={handleAddBeforeAfter}
              disabled={addingBeforeAfter}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
              style={{ background: 'var(--brand-primary)' }}
            >
              {addingBeforeAfter ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              {addingBeforeAfter ? 'Nahrávám...' : 'Nahrát a přidat'}
            </button>
          </div>
        )}

        <div className="grid gap-6">
          {beforeAfterItems.map((item) => (
            <div key={item.id} className="p-4 rounded-2xl border flex gap-6" style={{ background: 'var(--bg-base)', borderColor: 'var(--border)' }}>
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div className="space-y-2 text-center">
                  <span className="text-[10px] uppercase font-black text-red-400">Před</span>
                  <div className="aspect-video rounded-xl overflow-hidden bg-slate-100 border-2 border-red-100">
                    <img src={item.before_url || ''} alt="Před" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="space-y-2 text-center">
                  <span className="text-[10px] uppercase font-black text-green-500">Po</span>
                  <div className="aspect-video rounded-xl overflow-hidden bg-slate-100 border-2 border-green-100">
                    <img src={item.after_url || ''} alt="Po" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
              <div className="w-48 space-y-3 flex flex-col justify-between">
                <p className="text-sm text-slate-500 italic">{item.caption || 'Bez popisku'}</p>
                <button
                  onClick={() => handleDeleteBeforeAfter(item.id)}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 transition-colors border border-red-100"
                >
                  <Trash2 size={14} /> Smazat
                </button>
              </div>
            </div>
          ))}
          {beforeAfterItems.length === 0 && !showAddBeforeAfter && (
            <div className="text-center py-12 opacity-40 text-sm border-2 border-dashed rounded-2xl">
              Zatím žádné srovnání. Klikněte na „Přidat srovnání“.
            </div>
          )}
        </div>

        {/* --- Galerie "Z realizací" --- */}
        <div className="pt-8 border-t space-y-6" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">Galerie „Z realizací“</h3>
              <p className="text-sm text-slate-400">Fotky zobrazené v sekci „Z realizací“ na detailu této služby na webu.</p>
            </div>
            <input
              ref={galleryFileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => { const f = e.target.files; if (f && f.length > 0) handleAddGalleryPhotos(f) }}
            />
            <button
              onClick={() => galleryFileRef.current?.click()}
              disabled={uploadingGallery}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50"
              style={{ background: 'var(--brand-primary)' }}
            >
              {uploadingGallery ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {uploadingGallery ? 'Nahrávám...' : 'Nahrát fotky'}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryPhotos.map((photo) => (
              <div key={photo.id} className="relative group rounded-xl overflow-hidden aspect-[4/3] border" style={{ borderColor: 'var(--border)' }}>
                <img src={photo.url} alt={photo.caption || 'Realizace'} className="w-full h-full object-cover" />
                <button
                  onClick={() => handleDeleteGalleryPhoto(photo.id)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-white opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all"
                  title="Smazat fotku"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          {galleryPhotos.length === 0 && (
            <div className="text-center py-12 opacity-40 text-sm border-2 border-dashed rounded-2xl">
              Zatím žádné fotky v galerii. Klikněte na „Nahrát fotky“.
            </div>
          )}
        </div>
      </div>
    </>
  )
}
