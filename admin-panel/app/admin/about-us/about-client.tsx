'use client'

import { useState } from 'react'
import * as actionsRaw from './actions'
import { toast } from 'sonner'
import { Save, Award, Star, AlignLeft, Layout, CheckSquare, FileText } from 'lucide-react'
import { TiptapEditor } from '@/components/admin/editor'
import { unwrapActions } from '@/lib/action-result'
import { CertificatesTab } from './certificates-tab'
import type { Certificate } from './types'

const { updateAboutConfig } = unwrapActions(actionsRaw)

interface AboutClientProps {
  initialTitle: string
  initialSubtitle: string
  initialDescription: string
  initialStats: string
  initialCertificates: string
  initialWhyTitle: string
  initialWhyPoints: string
  initialCertsTitle: string
  initialCertsSubtitle: string
}

export function AboutClient({
  initialTitle,
  initialSubtitle,
  initialDescription,
  initialStats,
  initialCertificates,
  initialWhyTitle,
  initialWhyPoints,
  initialCertsTitle,
  initialCertsSubtitle,
}: AboutClientProps) {
  const [activeTab, setActiveTab] = useState<'texty' | 'stats' | 'certs'>('texty')

  // States for Tab 1: Texts
  const [title, setTitle] = useState(initialTitle)
  const [subtitle, setSubtitle] = useState(initialSubtitle)
  const [description, setDescription] = useState(initialDescription)

  // States for Tab 2: Stats & Why Us
  const [stats, setStats] = useState<{ label: string; value: string }[]>(JSON.parse(initialStats))
  const [whyTitle, setWhyTitle] = useState(initialWhyTitle)
  const [whyPoints, setWhyPoints] = useState<string[]>(JSON.parse(initialWhyPoints))

  // States for Tab 3: Certificates headings & list
  const [certsTitle, setCertsTitle] = useState(initialCertsTitle)
  const [certsSubtitle, setCertsSubtitle] = useState(initialCertsSubtitle)
  const [certificates, setCertificates] = useState<Certificate[]>(JSON.parse(initialCertificates))

  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async (key: string, value: string) => {
    setIsSaving(true)
    try {
      await updateAboutConfig(key, value)
      toast.success('Změny byly úspěšně uloženy')
    } catch {
      toast.error('Chyba při ukládání')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveCertificates = async () => {
    setIsSaving(true)
    try {
      // Nejprve uložíme záhlaví certifikací
      await updateAboutConfig('about_certs_title', certsTitle)
      await updateAboutConfig('about_certs_subtitle', certsSubtitle)
      // Poté samotný seznam certifikátů
      await updateAboutConfig('about_certificates', JSON.stringify(certificates))
      toast.success('Certifikace a všechny certifikáty byly uloženy')
    } catch {
      toast.error('Chyba při ukládání certifikátů')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveWhyUs = async () => {
    setIsSaving(true)
    try {
      await updateAboutConfig('about_why_title', whyTitle)
      await updateAboutConfig('about_why_points', JSON.stringify(whyPoints))
      toast.success('Sekce Proč NANOfusion byla úspěšně uložena')
    } catch {
      toast.error('Chyba při ukládání')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Správa sekce O nás
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Upravte kompletní obsah, který se zobrazí v modálním okně po kliknutí na „O nás“ (texty, výhody, statistiky a
          certifikace).
        </p>
      </div>

      {/* Přepínání záložek */}
      <div className="flex border-b border-slate-200" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={() => setActiveTab('texty')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-bold text-sm transition-all outline-none ${
            activeTab === 'texty'
              ? 'border-amber-500 text-amber-500'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <FileText size={16} /> Základní texty & Příběh
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-bold text-sm transition-all outline-none ${
            activeTab === 'stats'
              ? 'border-amber-500 text-amber-500'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Star size={16} /> Statistiky & Výhody (Proč my?)
        </button>
        <button
          onClick={() => setActiveTab('certs')}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 font-bold text-sm transition-all outline-none ${
            activeTab === 'certs'
              ? 'border-amber-500 text-amber-500'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Award size={16} /> Certifikace & Certifikáty
        </button>
      </div>

      {/* Tab 1: Texts & Story */}
      {activeTab === 'texty' && (
        <div className="grid grid-cols-1 gap-8">
          {/* Title & Subtitle */}
          <div
            className="rounded-2xl p-6 shadow-sm border space-y-6"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                <Layout size={20} />
              </div>
              <h2 className="text-lg font-bold">Základní nápisy</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-slate-400 mb-1.5 block">Hlavní titulek</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-3 rounded-xl border focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                  style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
                <button
                  onClick={() => handleSave('about_title', title)}
                  disabled={isSaving}
                  className="mt-2 flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-black transition-all disabled:opacity-50"
                >
                  <Save size={14} /> Uložit titulek
                </button>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-400 mb-1.5 block">Podnadpis (Slogan)</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full p-3 rounded-xl border focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                  style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
                <button
                  onClick={() => handleSave('about_subtitle', subtitle)}
                  disabled={isSaving}
                  className="mt-2 flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-black transition-all disabled:opacity-50"
                >
                  <Save size={14} /> Uložit podnadpis
                </button>
              </div>
            </div>
          </div>

          {/* Description Editor */}
          <div
            className="rounded-2xl p-6 shadow-sm border space-y-6"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                <AlignLeft size={20} />
              </div>
              <h2 className="text-lg font-bold">Hlavní příběh (Text)</h2>
            </div>

            <div className="space-y-4">
              <TiptapEditor content={description} onChange={setDescription} />

              <div className="flex justify-end">
                <button
                  onClick={() => handleSave('about_description', description)}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 transition-all disabled:opacity-50"
                >
                  <Save size={18} />
                  {isSaving ? 'Ukládám...' : 'Uložit hlavní text'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Stats & Why Us Benefits */}
      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 gap-8">
          {/* Stats Section */}
          <div
            className="rounded-2xl p-6 shadow-sm border space-y-6"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                <Star size={20} />
              </div>
              <h2 className="text-lg font-bold">Statistiky (Číselné údaje)</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.map((stat, idx) => (
                <div key={idx} className="space-y-3 p-4 rounded-xl border" style={{ borderColor: 'var(--border)' }}>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Popisek</label>
                    <input
                      type="text"
                      value={stat.label}
                      onChange={(e) => {
                        const newStats = [...stats]
                        newStats[idx].label = e.target.value
                        setStats(newStats)
                      }}
                      className="w-full p-2 rounded-lg border text-sm"
                      style={{
                        background: 'var(--bg-base)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Hodnota</label>
                    <input
                      type="text"
                      value={stat.value}
                      onChange={(e) => {
                        const newStats = [...stats]
                        newStats[idx].value = e.target.value
                        setStats(newStats)
                      }}
                      className="w-full p-2 rounded-lg border text-sm font-bold"
                      style={{
                        background: 'var(--bg-base)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => handleSave('about_stats', JSON.stringify(stats))}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-black transition-all disabled:opacity-50"
              >
                <Save size={18} /> Uložit statistiky
              </button>
            </div>
          </div>

          {/* Benefits ("Proč NANOfusion?") Section */}
          <div
            className="rounded-2xl p-6 shadow-sm border space-y-6"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                <CheckSquare size={20} />
              </div>
              <h2 className="text-lg font-bold">Důvody „Proč my?“ (Pravý panel)</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-slate-400 mb-1.5 block">Nadpis boxu</label>
                <input
                  type="text"
                  value={whyTitle}
                  onChange={(e) => setWhyTitle(e.target.value)}
                  className="w-full p-3 rounded-xl border focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                  style={{ background: 'var(--bg-base)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold uppercase text-slate-400 mb-1.5 block">
                  3 klíčové výhody (s ikonou ✓)
                </label>
                {whyPoints.map((point, idx) => (
                  <div key={idx} className="flex gap-3 items-center">
                    <span className="font-bold text-amber-500">✓</span>
                    <input
                      type="text"
                      value={point}
                      onChange={(e) => {
                        const newPoints = [...whyPoints]
                        newPoints[idx] = e.target.value
                        setWhyPoints(newPoints)
                      }}
                      className="flex-1 p-3 rounded-xl border outline-none"
                      style={{
                        background: 'var(--bg-base)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveWhyUs}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-black transition-all disabled:opacity-50"
                >
                  <Save size={18} /> Uložit sekci Proč my?
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Certificates headings & Full CRUD */}
      {activeTab === 'certs' && (
        <CertificatesTab
          certsTitle={certsTitle}
          setCertsTitle={setCertsTitle}
          certsSubtitle={certsSubtitle}
          setCertsSubtitle={setCertsSubtitle}
          certificates={certificates}
          setCertificates={setCertificates}
          isSaving={isSaving}
          onSave={handleSaveCertificates}
        />
      )}
    </div>
  )
}
