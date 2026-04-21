'use client'

import { useState } from 'react'
import { updateHeroTitle, toggleHeroMedia, addHeroMedia, deleteHeroMedia } from './actions'
import { normalizeMediaUrl } from '@/lib/utils'
import { toast } from 'sonner'
import { Plus, Trash2, Globe, Image as ImageIcon, Video, Save, ExternalLink } from 'lucide-react'

interface HeroMedia {
  id: string
  url: string
  type: 'image' | 'video'
  is_active: boolean
  updated_at: string
}

export function HeroClient({ 
  initialItems, 
  initialTitle 
}: { 
  initialItems: HeroMedia[], 
  initialTitle: string 
}) {
  const [title, setTitle] = useState(initialTitle)
  const [items, setItems] = useState(initialItems)
  const [isSavingTitle, setIsSavingTitle] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [newUrl, setNewUrl] = useState('')
  const [newType, setNewType] = useState<'image' | 'video'>('image')

  const active = items.find((h) => h.is_active)

  const handleTitleSave = async () => {
    setIsSavingTitle(true)
    try {
      await updateHeroTitle(title)
      toast.success('Text v hero sekci byl aktualizován')
    } catch (e) {
      toast.error('Chyba při ukládání textu')
    } finally {
      setIsSavingTitle(false)
    }
  }

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      await toggleHeroMedia(id, !currentStatus)
      setItems(items.map(item => ({
        ...item,
        is_active: item.id === id ? !currentStatus : (!currentStatus ? false : item.is_active)
      })))
      toast.success(currentStatus ? 'Médium deaktivováno' : 'Médium bylo nastaveno jako aktivní')
    } catch (e) {
      toast.error('Chyba při změně stavu')
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUrl) return
    setIsAdding(true)
    try {
      await addHeroMedia(newUrl, newType)
      setNewUrl('')
      toast.success('Nové médium bylo přidáno do knihovny')
      // Note: Revalidation will refresh the page and initialItems, 
      // but for immediate UI we could also append locally if needed.
    } catch (e) {
      toast.error('Chyba při přidávání média')
    } finally {
      setIsAdding(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Opravdu chcete toto médium smazat?')) return
    try {
      await deleteHeroMedia(id)
      setItems(items.filter(i => i.id !== id))
      toast.success('Médium bylo smazáno')
    } catch (e) {
      toast.error('Chyba při mazání')
    }
  }

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Správa Hero sekce</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Zde můžete změnit hlavní nápis a pozadí (obrázek/video) úvodní části webu.
        </p>
      </div>

      {/* 1. Hero Title Configuration */}
      <div className="rounded-2xl p-6 shadow-sm border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
            <Globe size={20} />
          </div>
          <h2 className="text-lg font-bold">Hlavní textový nápis</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase text-slate-400 mb-1.5 block">Nápis (podporuje HTML tagy jako &lt;br&gt;)</label>
            <textarea 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-4 rounded-xl border focus:ring-2 focus:ring-amber-500/20 outline-none transition-all font-medium"
              style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              rows={3}
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleTitleSave}
              disabled={isSavingTitle}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 transition-all disabled:opacity-50"
            >
              <Save size={18} />
              {isSavingTitle ? 'Ukládám...' : 'Uložit nápis'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 2. Active Preview */}
        <div className="space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Aktuální náhled</h3>
          {active ? (
            <div className="rounded-2xl overflow-hidden relative border-4 border-amber-500 shadow-xl" style={{ background: '#000' }}>
              <div className="absolute top-4 left-4 z-10">
                <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  Live na webu
                </span>
              </div>
              <div className="aspect-video relative">
                {active.type === 'image' ? (
                  <img src={normalizeMediaUrl(active.url)} alt="Hero" className="w-full h-full object-cover" />
                ) : (
                  <iframe
                    src={normalizeMediaUrl(active.url)}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
                   <p className="text-white font-bold text-lg mb-1 leading-tight" dangerouslySetInnerHTML={{ __html: title }} />
                   <div className="flex gap-2">
                      <span className="text-[10px] bg-white/20 backdrop-blur-md text-white px-2 py-0.5 rounded font-bold uppercase">{active.type}</span>
                   </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="aspect-video rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 bg-slate-50">
               <ImageIcon size={40} className="mb-2 opacity-20" />
               <p className="font-bold text-sm">Žádné aktivní médium</p>
               <p className="text-xs">Vyberte z knihovny níže</p>
            </div>
          )}
        </div>

        {/* 3. Add New Media */}
        <div className="space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Přidat nové médium</h3>
          <form 
            onSubmit={handleAdd}
            className="rounded-2xl p-6 border shadow-sm space-y-4" 
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
          >
            <div className="flex gap-2 p-1 rounded-xl" style={{ background: 'var(--bg-base)', border: '1px solid var(--border)' }}>
               <button 
                 type="button"
                 onClick={() => setNewType('image')}
                 className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-xs transition-all ${newType === 'image' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
               >
                 <ImageIcon size={14} /> Obrázek
               </button>
               <button 
                 type="button"
                 onClick={() => setNewType('video')}
                 className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-xs transition-all ${newType === 'video' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
               >
                 <Video size={14} /> Youtube Video
               </button>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block">URL Adresa (Google Drive, Youtube, Unsplash...)</label>
              <input 
                type="text"
                placeholder="Vložte odkaz..."
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="w-full p-3 rounded-xl border focus:ring-2 focus:ring-amber-500/20 outline-none transition-all text-sm"
                style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
              <p className="text-[10px] text-slate-400 mt-2 italic">
                * U videí vkládejte klasický odkaz na Youtube video.
              </p>
            </div>

            <button
              type="submit"
              disabled={isAdding || !newUrl}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-black transition-all disabled:opacity-50"
            >
              <Plus size={18} />
              {isAdding ? 'Přidávám...' : 'Přidat do knihovny'}
            </button>
          </form>
        </div>
      </div>

      {/* 4. Media Library */}
      <div className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Knihovna médií</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div 
              key={item.id} 
              className="group rounded-2xl overflow-hidden border transition-all hover:shadow-md" 
              style={{ background: 'var(--bg-surface)', borderColor: item.is_active ? 'var(--brand-primary)' : 'var(--border)' }}
            >
              <div className="aspect-video relative overflow-hidden bg-black">
                {item.type === 'image' ? (
                  <img src={normalizeMediaUrl(item.url)} alt="Thumbnail" className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                     <Video size={32} className="text-white/20" />
                     <img src={`https://img.youtube.com/vi/${item.url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([^\/\?\&]+)/)?.[1]}/hqdefault.jpg`} className="absolute inset-0 w-full h-full object-cover opacity-40" />
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                   <button 
                     onClick={() => handleToggle(item.id, item.is_active)}
                     className={`px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-tighter transition-all ${item.is_active ? 'bg-white text-black' : 'bg-amber-500 text-white hover:scale-105'}`}
                   >
                     {item.is_active ? 'Aktivní' : 'Aktivovat'}
                   </button>
                </div>
              </div>
              
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                    {item.type}
                  </span>
                  <p className="text-[10px] text-slate-400">
                    {new Date(item.updated_at).toLocaleDateString('cs-CZ')}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                   <p className="flex-1 text-[11px] truncate font-mono text-slate-400" title={item.url}>
                     {item.url}
                   </p>
                   <a href={item.url} target="_blank" className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 transition-colors">
                      <ExternalLink size={14} />
                   </a>
                   {!item.is_active && (
                     <button 
                       onClick={() => handleDelete(item.id)}
                       className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors"
                     >
                        <Trash2 size={14} />
                     </button>
                   )}
                </div>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed rounded-2xl">
               <ImageIcon size={48} className="mb-2 opacity-10" />
               <p className="font-bold">Knihovna je prázdná</p>
               <p className="text-xs">Přidejte první obrázek nebo video pomocí formuláře výše.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
