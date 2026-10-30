'use client'

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2, Upload, Loader2, X } from 'lucide-react'
import { compressImage, errorMessage } from '@/lib/utils'
import { unwrapActions } from '@/lib/action-result'
import { TiptapEditor } from '@/components/admin/editor'
import * as actionsRaw from '../../actions'
import type { Service } from '../types'
import { parseFeature } from '../types'

const { uploadServiceHeroImage, uploadServiceVideo } = unwrapActions(actionsRaw)

/** Záložka „Základní info“: texty, body „Co nabízíme“, úvodní obrázek a video. */
export function GeneralTab({ service, setService }: { service: Service; setService: (s: Service) => void }) {
  const [uploadingHero, setUploadingHero] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const heroFileRef = useRef<HTMLInputElement>(null)
  const videoFileRef = useRef<HTMLInputElement>(null)
  const handleVideoUpload = async (file: File) => {
    setUploadingVideo(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const url = await uploadServiceVideo(service.id, fd)
      setService({ ...service, video_url: url })
      toast.success('Krátké video pro náhled služby nahráno')
    } catch (err) {
      toast.error('Chyba uploadu videa: ' + errorMessage(err))
    } finally {
      setUploadingVideo(false)
    }
  }
  // --- Hero image upload ---
  const handleHeroUpload = async (file: File) => {
    setUploadingHero(true)
    try {
      const compressedFile = await compressImage(file)
      const fd = new FormData()
      fd.append('file', compressedFile)
      const url = await uploadServiceHeroImage(service.id, fd)
      setService({ ...service, hero_image_url: url })
      toast.success('Hero obrázek nahrán')
    } catch (err) {
      toast.error('Chyba uploadu: ' + errorMessage(err))
    } finally {
      setUploadingHero(false)
    }
  }

  return (
    <>
      <div className="max-w-3xl space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Název služby</label>
            <input
              type="text"
              value={service.name}
              onChange={(e) => setService({ ...service, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-amber-500/20"
              style={{ background: 'var(--bg-base)', borderColor: 'var(--border)' }}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">URL Slug</label>
            <input
              type="text"
              value={service.slug}
              onChange={(e) => setService({ ...service, slug: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border outline-none font-mono text-sm"
              style={{ background: 'var(--bg-base)', borderColor: 'var(--border)' }}
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Hlavní popis (Web)</label>
          <TiptapEditor
            content={service.description || ''}
            onChange={(html) => setService({ ...service, description: html })}
          />
        </div>

        <div className="space-y-4">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Co to obnáší (Proces)</label>
          <TiptapEditor
            content={service.process_description || ''}
            onChange={(html) => setService({ ...service, process_description: html })}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Co nabízíme (Vlastnosti s fajfkou)
              </label>
              <p className="text-xs text-slate-500 mt-0.5">
                Jednotlivé body zobrazené v boxu „Co nabízíme:“ pod popisem služby.
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {(service.features || []).map((feature: string, idx: number) => {
              const { title, desc } = parseFeature(feature)

              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl border flex flex-col md:flex-row gap-3 items-start md:items-center"
                  style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
                >
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
                    <div className="md:col-span-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Název položky
                      </label>
                      <input
                        type="text"
                        value={title}
                        placeholder="Např. Nano-ochrana až 10 let"
                        onChange={(e) => {
                          const newFeatures = [...(service.features || [])]
                          newFeatures[idx] = JSON.stringify({ title: e.target.value, desc })
                          setService({ ...service, features: newFeatures })
                        }}
                        className="w-full px-3 py-2 rounded-lg border text-sm font-bold outline-none"
                        style={{ background: 'var(--bg-base)', borderColor: 'var(--border)' }}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Podrobný popis
                      </label>
                      <input
                        type="text"
                        value={desc}
                        placeholder="Např. Špičková impregnace odpuzuje vodu a chrání povrch..."
                        onChange={(e) => {
                          const newFeatures = [...(service.features || [])]
                          newFeatures[idx] = JSON.stringify({ title, desc: e.target.value })
                          setService({ ...service, features: newFeatures })
                        }}
                        className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                        style={{ background: 'var(--bg-base)', borderColor: 'var(--border)' }}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newFeatures = (service.features || []).filter((_, i) => i !== idx)
                      setService({ ...service, features: newFeatures })
                    }}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-colors mt-2 md:mt-5 self-end md:self-center"
                    title="Smazat položku"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )
            })}
            <button
              type="button"
              onClick={() =>
                setService({
                  ...service,
                  features: [...(service.features || []), JSON.stringify({ title: '', desc: '' })],
                })
              }
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-amber-500/50 text-sm font-bold text-amber-500 hover:bg-amber-500/10 transition-colors mt-2"
            >
              <Plus size={16} /> Přidat další položku do „Co nabízíme“
            </button>
          </div>
        </div>

        {/* Hero image upload */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Hero Obrázek</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={service.hero_image_url || ''}
              onChange={(e) => setService({ ...service, hero_image_url: e.target.value })}
              className="flex-1 px-4 py-3 rounded-xl border outline-none"
              style={{ background: 'var(--bg-base)', borderColor: 'var(--border)' }}
              placeholder="https://... nebo nahrajte soubor →"
            />
            <input
              ref={heroFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleHeroUpload(f)
              }}
            />
            <button
              onClick={() => heroFileRef.current?.click()}
              disabled={uploadingHero}
              className="px-4 py-3 rounded-xl border flex items-center gap-2 text-sm font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              {uploadingHero ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
              {uploadingHero ? 'Nahrávám...' : 'Nahrát'}
            </button>
          </div>
          {service.hero_image_url && (
            <div className="mt-3 rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
              <img src={service.hero_image_url} alt="Hero preview" className="w-full h-40 object-cover" />
            </div>
          )}
        </div>

        {/* Video ke službě (zobrazí se pod sekcí Z realizací) */}
        <div className="space-y-2 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Video ke službě (YouTube, Google Disk, MP4...)
            </label>
            <span className="text-[11px] text-amber-600 font-medium">Zobrazí se pod sekcí Z realizací</span>
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              value={service.video_url || ''}
              onChange={(e) => setService({ ...service, video_url: e.target.value })}
              className="flex-1 px-4 py-3 rounded-xl border outline-none font-mono text-sm"
              style={{ background: 'var(--bg-base)', borderColor: 'var(--border)' }}
              placeholder="Vložte YouTube odkaz, Google Disk, odkaz na video nebo nahrajte soubor →"
            />
            <input
              ref={videoFileRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleVideoUpload(f)
              }}
            />
            <button
              onClick={() => videoFileRef.current?.click()}
              disabled={uploadingVideo}
              className="px-4 py-3 rounded-xl border flex items-center gap-2 text-sm font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              {uploadingVideo ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
              {uploadingVideo ? 'Nahrávám...' : 'Nahrát video'}
            </button>
          </div>
          {service.video_url &&
            (() => {
              const trimmed = (service.video_url || '').trim()
              const ytMatch = trimmed.match(
                /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/
              )
              const ytId = ytMatch ? ytMatch[1] : null
              const driveMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/)
              const driveId = driveMatch ? driveMatch[1] : null

              return (
                <div
                  className="mt-3 rounded-xl overflow-hidden border relative aspect-video max-w-md bg-black"
                  style={{ borderColor: 'var(--border)' }}
                >
                  {ytId ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${ytId}`}
                      className="w-full h-full border-0"
                      allow="autoplay; encrypted-media"
                    />
                  ) : driveId ? (
                    <iframe
                      src={`https://drive.google.com/file/d/${driveId}/preview`}
                      className="w-full h-full border-0"
                      allow="autoplay"
                    />
                  ) : (
                    <video src={service.video_url} controls playsInline className="w-full h-full object-cover" />
                  )}
                  <button
                    onClick={() => setService({ ...service, video_url: '' })}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-white hover:bg-black transition-colors z-10"
                    title="Odstranit video"
                  >
                    <X size={16} />
                  </button>
                </div>
              )
            })()}
        </div>
      </div>
    </>
  )
}
