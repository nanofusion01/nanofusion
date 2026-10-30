'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Save, Plus, Trash2, Image as ImageIcon, Award } from 'lucide-react'
import NextImage from 'next/image'
import { unwrapActions } from '@/lib/action-result'
import * as certificatesActionsRaw from '../certificates/actions'
import type { Certificate } from './types'

const { uploadCertificateImage } = unwrapActions(certificatesActionsRaw)

/**
 * Záložka „Certifikace“: nadpisy sekce a seznam certifikátů. Stav drží
 * rodič, aby se neuložené úpravy neztratily při přepnutí záložky.
 */
export function CertificatesTab({
  certsTitle,
  setCertsTitle,
  certsSubtitle,
  setCertsSubtitle,
  certificates,
  setCertificates,
  isSaving,
  onSave,
}: {
  certsTitle: string
  setCertsTitle: (value: string) => void
  certsSubtitle: string
  setCertsSubtitle: (value: string) => void
  certificates: Certificate[]
  setCertificates: React.Dispatch<React.SetStateAction<Certificate[]>>
  isSaving: boolean
  onSave: () => void
}) {
  const [uploadingId, setUploadingId] = useState<string | null>(null)

  const handleAddCert = () => {
    const newCert: Certificate = {
      id: crypto.randomUUID(),
      title: 'Nový certifikát',
      description: 'Popis certifikátu...',
      imageUrl: ''
    }
    setCertificates((prev) => [newCert, ...prev])
  }

  const handleRemoveCert = (id: string) => {
    setCertificates((prev) => prev.filter(c => c.id !== id))
  }

  const handleCertChange = (id: string, field: keyof Certificate, value: string) => {
    setCertificates((prev) => prev.map(c => c.id === id ? { ...c, [field]: value } : c))
  }

  const handleCertImageUpload = async (id: string, file: File) => {
    setUploadingId(id)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const url = await uploadCertificateImage(formData)
      handleCertChange(id, 'imageUrl', url)
      toast.success('Obrázek nahrán')
    } catch {
      toast.error('Chyba při nahrávání')
    } finally {
      setUploadingId(null)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8">
      {/* Certificate headers */}
      <div className="rounded-2xl p-6 shadow-sm border space-y-6" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
            <Award size={20} />
          </div>
          <h2 className="text-lg font-bold">Nadpisy sekce Certifikací</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase text-slate-400 mb-1.5 block">Hlavní nadpis certifikací</label>
            <input 
              type="text"
              value={certsTitle}
              onChange={(e) => setCertsTitle(e.target.value)}
              className="w-full p-3 rounded-xl border focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
              style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-slate-400 mb-1.5 block">Průvodní text (Popisek)</label>
            <textarea 
              value={certsSubtitle}
              onChange={(e) => setCertsSubtitle(e.target.value)}
              rows={3}
              className="w-full p-3 rounded-xl border focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
              style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
            />
          </div>
        </div>
      </div>

      {/* Certificate cards CRUD list */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold">Jednotlivé certifikáty</h2>
            <p className="text-xs text-slate-400">Přidávejte a spravujte certifikáty, které se na veřejné stránce zobrazí v mřížce.</p>
          </div>
          <button
            onClick={handleAddCert}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 transition-all text-sm"
          >
            <Plus size={18} /> Přidat certifikát
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <div 
              key={cert.id} 
              className="rounded-2xl border p-6 space-y-4 relative group transition-all hover:shadow-md"
              style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
            >
              <button 
                onClick={() => handleRemoveCert(cert.id)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={18} />
              </button>

              <div className="flex gap-6">
                {/* Image Preview / Upload */}
                <div className="w-32 h-40 flex-shrink-0 relative rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                  {cert.imageUrl ? (
                    <NextImage 
                      src={cert.imageUrl} 
                      alt={cert.title} 
                      fill 
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                      <Award size={32} />
                      <span className="text-[10px] mt-2 font-bold uppercase text-center px-2">Bez obrázku</span>
                    </div>
                  )}
                  
                  <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={(e) => e.target.files?.[0] && handleCertImageUpload(cert.id, e.target.files[0])}
                      accept="image/*"
                    />
                    <div className="text-white text-xs font-bold flex flex-col items-center">
                      {uploadingId === cert.id ? 'Nahrávám...' : (
                        <>
                          <ImageIcon size={20} className="mb-1" />
                          Změnit
                        </>
                      )}
                    </div>
                  </label>
                </div>

                {/* Form Fields */}
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Název certifikátu</label>
                    <input 
                      type="text"
                      value={cert.title}
                      onChange={(e) => handleCertChange(cert.id, 'title', e.target.value)}
                      className="w-full p-2 rounded-lg border text-sm font-semibold outline-none focus:ring-1 focus:ring-amber-500/30"
                      style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Popis / Detaily</label>
                    <textarea 
                      value={cert.description}
                      onChange={(e) => handleCertChange(cert.id, 'description', e.target.value)}
                      rows={4}
                      className="w-full p-2 rounded-lg border text-xs outline-none focus:ring-1 focus:ring-amber-500/30"
                      style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {certificates.length === 0 && (
          <div className="py-20 text-center border-2 border-dashed rounded-3xl" style={{ borderColor: 'var(--border)' }}>
            <Award size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">Zatím nebyly přidány žádné certifikáty.</p>
          </div>
        )}
      </div>

      {/* Global Save for Tab 3 */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <button
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-slate-900 text-white font-bold shadow-2xl hover:bg-black transition-all disabled:opacity-50"
        >
          {isSaving ? 'Ukládám...' : (
            <>
              <Save size={20} /> Uložit všechny certifikáty & nadpisy
            </>
          )}
        </button>
      </div>
    </div>
  )
}
