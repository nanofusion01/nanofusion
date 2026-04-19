'use client'

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Play,
  Image as ImageIcon,
  AlertTriangle,
  Link,
  X,
  Upload,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Tables } from '@/lib/database.types'
import { addYoutubeItem, deleteGalleryItem, toggleGalleryItemActive } from './actions'

type GalleryItem = Tables<'gallery_items'>

interface GalleryClientProps {
  initialItems: GalleryItem[]
}

type AddMode = 'image' | 'youtube' | null

export function GalleryClient({ initialItems }: GalleryClientProps) {
  const [items, setItems] = useState<GalleryItem[]>(initialItems)
  const [addMode, setAddMode] = useState<AddMode>(null)
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [caption, setCaption] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [adding, setAdding] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate
    if (!file.type.startsWith('image/')) {
      toast.error('Povoleny jsou pouze obrázky')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Obrázek je příliš velký (max 10MB)')
      return
    }

    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `gallery/${Date.now()}.${ext}`
      const { data, error } = await supabase.storage
        .from('gallery')
        .upload(path, file, { cacheControl: '3600', upsert: false })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(data.path)

      const { data: newItem, error: dbError } = await supabase.from('gallery_items').insert({
        type: 'image',
        url: publicUrl,
        caption: caption || null,
        order_index: items.length,
        is_active: true,
      }).select().single()

      if (dbError) throw dbError

      setItems((prev) => [...prev, newItem])
      toast.success('Obrázek přidán')
      setAddMode(null)
      setCaption('')
    } catch {
      toast.error('Nepodařilo se nahrát obrázek')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleAddYoutube = async () => {
    if (!youtubeUrl) {
      toast.error('Zadejte YouTube URL')
      return
    }
    setAdding(true)
    try {
      await addYoutubeItem(youtubeUrl, caption)
      toast.success('YouTube video přidáno')
      setAddMode(null)
      setYoutubeUrl('')
      setCaption('')
      window.location.reload()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Nepodařilo se přidat video')
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteGalleryItem(id)
      setItems((prev) => prev.filter((i) => i.id !== id))
      toast.success('Položka smazána')
      setDeleteConfirm(null)
    } catch {
      toast.error('Nepodařilo se smazat položku')
    }
  }

  const handleToggleActive = async (item: GalleryItem) => {
    try {
      await toggleGalleryItemActive(item.id, !item.is_active)
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, is_active: !i.is_active } : i))
      )
      toast.success(item.is_active ? 'Skryta' : 'Zobrazena')
    } catch {
      toast.error('Nepodařilo se aktualizovat viditelnost')
    }
  }

  const getYoutubeThumbnail = (youtubeId: string) =>
    `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Galerie realizací</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {items.length} položek · {items.filter((i) => i.is_active).length} zobrazeno
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setAddMode('image')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
            style={{ border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
          >
            <Upload size={16} />
            Nahrát obrázek
          </button>
          <button
            onClick={() => setAddMode('youtube')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: '#ef4444' }}
          >
            <Link size={16} />
            YouTube Video
          </button>
        </div>
      </div>

      {/* Add YouTube Form */}
      {addMode === 'youtube' && (
        <div
          className="rounded-xl p-5 space-y-4 animate-fade-in"
          style={{ background: 'var(--bg-surface)', border: '2px solid #ef4444' }}
        >
          <div className="flex items-center gap-2">
            <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Přidat YouTube video</h2>
            <button onClick={() => setAddMode(null)} style={{ color: 'var(--text-muted)', marginLeft: 'auto' }}>
              <X size={18} />
            </button>
          </div>
          <input
            type="url"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          />
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Popis videa (volitelné)"
            className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          />
          <div className="flex gap-3">
            <button
              onClick={() => setAddMode(null)}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold"
              style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            >
              Zrušit
            </button>
            <button
              onClick={handleAddYoutube}
              disabled={adding}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: '#ef4444' }}
            >
              {adding ? 'Přidávám...' : 'Přidat video'}
            </button>
          </div>
        </div>
      )}

      {/* Add Image Form */}
      {addMode === 'image' && (
        <div
          className="rounded-xl p-5 space-y-4 animate-fade-in"
          style={{ background: 'var(--bg-surface)', border: '2px solid var(--brand-primary)' }}
        >
          <div className="flex items-center gap-2">
            <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Nahrát obrázek</h2>
            <button onClick={() => setAddMode(null)} style={{ color: 'var(--text-muted)', marginLeft: 'auto' }}>
              <X size={18} />
            </button>
          </div>
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Popis obrázku (volitelné)"
            className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          />
          <div
            className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all"
            style={{ borderColor: 'var(--border)' }}
            onClick={() => fileRef.current?.click()}
          >
            <Upload size={32} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {uploading ? 'Nahrávám...' : 'Klikněte pro výběr obrázku (max 10MB)'}
            </p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>
        </div>
      )}

      {/* Gallery Grid */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-xl gap-3" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          <ImageIcon size={44} style={{ color: 'var(--text-muted)' }} />
          <p style={{ color: 'var(--text-muted)' }}>Galerie je prázdná</p>
        </div>
      ) : (
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))' }}
        >
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-xl overflow-hidden transition-all duration-150"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                opacity: item.is_active ? 1 : 0.5,
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              {/* Thumbnail */}
              <div
                className="relative"
                style={{
                  height: 160,
                  backgroundImage: `url(${item.type === 'youtube' && item.youtube_id
                      ? getYoutubeThumbnail(item.youtube_id)
                      : item.url
                    })`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  background: !item.url ? 'var(--bg-surface-2)' : undefined,
                }}
              >
                {item.type === 'youtube' && (
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.3)' }}
                  >
                    <div
                      className="rounded-full flex items-center justify-center"
                      style={{ width: 40, height: 40, background: '#ef4444' }}
                    >
                      <span className="text-white text-lg">▶</span>
                    </div>
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1.5">
                  <button
                    onClick={() => handleToggleActive(item)}
                    className="p-1.5 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.9)', color: item.is_active ? '#16a34a' : '#94a3b8' }}
                  >
                    {item.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(item.id)}
                    className="p-1.5 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.9)', color: '#ef4444' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              {item.caption && (
                <div className="px-3 py-2">
                  <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                    {item.caption}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-sm rounded-2xl p-6 animate-fade-in" style={{ background: 'var(--bg-surface)', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-full flex items-center justify-center" style={{ width: 44, height: 44, background: '#fef2f2' }}>
                <AlertTriangle size={22} style={{ color: '#ef4444' }} />
              </div>
              <div>
                <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Smazat položku?</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Tato akce je nevratná</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                Zrušit
              </button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: '#ef4444' }}>
                Smazat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
