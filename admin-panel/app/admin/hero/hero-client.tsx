'use client'

import { useState } from 'react'
import { updateHeroTitle, toggleHeroMedia } from './actions'

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
  const [isSaving, setIsSaving] = useState(false)

  const active = items.find((h) => h.is_active)

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      await toggleHeroMedia(id, !currentStatus)
      setItems(items.map(item => ({
        ...item,
        is_active: item.id === id ? !currentStatus : (!currentStatus ? false : item.is_active)
      })))
    } catch (e) {
        alert('Chyba při přepínání média')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Hero sekce</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Nastavte obrázek nebo video pro hlavní hero sekci webu
        </p>
      </div>

      {/* Active Preview */}
      {active && (
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--brand-primary)' }}>
          <div className="px-5 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--border)' }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#22c55e' }} />
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Právě zobrazeno na webu</p>
          </div>
          <div className="p-5">
            {active.type === 'image' ? (
              <img src={active.url} alt="Hero" className="rounded-xl max-h-64 object-cover w-full" />
            ) : (
              <div className="rounded-xl overflow-hidden aspect-video max-h-64">
                <iframe
                  src={active.url.replace('watch?v=', 'embed/')}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Media History */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Knihovna médií</p>
        </div>
        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-black/5">
              <button 
                onClick={() => handleToggle(item.id, item.is_active)}
                className={`w-10 h-6 rounded-full relative transition-all ${item.is_active ? 'bg-green-500' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${item.is_active ? 'left-5' : 'left-1'}`} />
              </button>
              <span className="text-xs px-2 py-0.5 rounded font-semibold uppercase" style={{ background: 'var(--bg-surface-2)', color: 'var(--text-muted)' }}>
                {item.type}
              </span>
              <p className="flex-1 text-sm truncate" style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: 11 }}>
                {item.url}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {new Date(item.updated_at).toLocaleDateString('cs-CZ')}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
