'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Save, 
  Layout, 
  Camera, 
  MessageSquareQuote, 
  Plus, 
  Trash2, 
  Upload,
  Star
} from 'lucide-react'
import { Tables } from '@/lib/database.types'
import { updateService } from '../actions'
import { createClient } from '@/lib/supabase/client'

type Service = Tables<'services'>
type BeforeAfter = Tables<'service_before_after'>
type ServiceReview = Tables<'service_reviews'>

interface Props {
  service: Service
  beforeAfterItems: BeforeAfter[]
  serviceReviews: ServiceReview[]
}

export function ServiceDetailClient({ service: initialService, beforeAfterItems, serviceReviews }: Props) {
  const [activeTab, setActiveTab] = useState<'general' | 'photos' | 'reviews'>('general')
  const [service, setService] = useState(initialService)
  const [saving, setSaving] = useState(false)
  
  // General Form
  const handleSaveGeneral = async () => {
    setSaving(true)
    try {
      const { id, ...data } = service
      await updateService(id, data)
      toast.success('Změny uloženy')
    } catch (err: any) {
      toast.error('Chyba: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/services" 
            className="p-2 rounded-xl border hover:bg-slate-50 transition-colors"
            style={{ borderColor: 'var(--border)' }}
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{service.name}</h1>
            <p className="text-sm opacity-60">Úprava služby a jejího obsahu</p>
          </div>
        </div>
        <button
          onClick={handleSaveGeneral}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-amber-500/20"
          style={{ background: 'var(--brand-primary)' }}
        >
          <Save size={18} />
          {saving ? 'Ukládám...' : 'Uložit vše'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 rounded-2xl w-fit" style={{ background: 'var(--bg-surface-2)' }}>
        {[
          { id: 'general', label: 'Základní info', icon: <Layout size={16} /> },
          { id: 'photos', label: 'Před & Po fotky', icon: <Camera size={16} /> },
          { id: 'reviews', label: 'Recenze služby', icon: <MessageSquareQuote size={16} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
            style={{
              background: activeTab === tab.id ? 'var(--bg-surface)' : 'transparent',
              color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              boxShadow: activeTab === tab.id ? 'var(--shadow-sm)' : 'none'
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-8 rounded-3xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        {activeTab === 'general' && (
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

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Hlavní popis</label>
              <textarea
                value={service.description || ''}
                onChange={(e) => setService({ ...service, description: e.target.value })}
                rows={6}
                className="w-full px-4 py-3 rounded-xl border outline-none resize-none"
                style={{ background: 'var(--bg-base)', borderColor: 'var(--border)' }}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Hero Obrázek (URL)</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={service.hero_image_url || ''}
                  onChange={(e) => setService({ ...service, hero_image_url: e.target.value })}
                  className="flex-1 px-4 py-3 rounded-xl border outline-none"
                  style={{ background: 'var(--bg-base)', borderColor: 'var(--border)' }}
                  placeholder="https://..."
                />
                <button className="px-4 py-3 rounded-xl border flex items-center gap-2 text-sm font-semibold hover:bg-slate-50 transition-colors">
                  <Upload size={18} />
                  Nahrát
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'photos' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">Před & Po srovnání</h3>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border hover:bg-slate-50 transition-colors">
                <Plus size={16} /> Přidat srovnání
              </button>
            </div>
            
            <div className="grid gap-6">
              {beforeAfterItems.map((item) => (
                <div key={item.id} className="p-4 rounded-2xl border flex gap-6" style={{ background: 'var(--bg-base)', borderColor: 'var(--border)' }}>
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div className="space-y-2 text-center">
                      <span className="text-[10px] uppercase font-black text-slate-400">Před</span>
                      <div className="aspect-video rounded-xl overflow-hidden bg-slate-100 border">
                        <img src={item.before_url || ''} className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <div className="space-y-2 text-center">
                      <span className="text-[10px] uppercase font-black text-slate-400">Po</span>
                      <div className="aspect-video rounded-xl overflow-hidden bg-slate-100 border">
                        <img src={item.after_url || ''} className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>
                  <div className="w-64 space-y-4">
                    <input 
                      type="text" 
                      defaultValue={item.caption || ''} 
                      className="w-full px-3 py-2 rounded-lg border text-sm"
                      placeholder="Popisek (např. Špinavá střecha vs. Nano)"
                    />
                    <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 size={14} /> Smazat toto srovnání
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">Specifické recenze pro tuto službu</h3>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border hover:bg-slate-50 transition-colors">
                <Plus size={16} /> Přidat recenzi
              </button>
            </div>

            <div className="grid gap-3">
              {serviceReviews.map((review) => (
                <div key={review.id} className="p-4 rounded-xl border flex items-start gap-4" style={{ background: 'var(--bg-base)', borderColor: 'var(--border)' }}>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold text-sm">{review.author}</span>
                      <div className="flex gap-0.5">
                        {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} size={12} fill="#f59e0b" color="#f59e0b" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm line-clamp-2 italic text-slate-600">{review.content}</p>
                  </div>
                  <button className="p-2 text-red-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
