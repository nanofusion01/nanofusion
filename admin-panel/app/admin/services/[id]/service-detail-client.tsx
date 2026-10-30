'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'
import { ArrowLeft, Save, Layout, Camera, MessageSquareQuote, ListOrdered } from 'lucide-react'
import { errorMessage } from '@/lib/utils'
import * as actionsRaw from '../actions'
import { unwrapActions } from '@/lib/action-result'
import { GeneralTab } from './tabs/general-tab'
import { ProcessTab } from './tabs/process-tab'
import { PhotosTab } from './tabs/photos-tab'
import { FaqsTab } from './tabs/faqs-tab'
import { ReviewsTab } from './tabs/reviews-tab'

const { updateService } = unwrapActions(actionsRaw)

import type {
  Service,
  BeforeAfter,
  GalleryPhoto,
  ServiceFAQ,
  ServiceReview,
  ExternalReview,
  ProcessStep,
} from './types'

interface Props {
  service: Service
  beforeAfterItems: BeforeAfter[]
  galleryPhotos: GalleryPhoto[]
  serviceFaqs: ServiceFAQ[]
  serviceReviews: ServiceReview[]
  externalReviews: ExternalReview[]
  initialProcessSteps?: ProcessStep[]
}

const DEFAULT_BENEFITS: Record<string, Array<{ title: string; desc: string }>> = {
  'cisteni-fasad': [
    { title: 'Odstranění řas a plísní', desc: 'Vyčistíme fasádu od smogu, plísní, řas, prachu a organických nánosů.' },
    { title: 'Nano-ochrana až 10 let', desc: 'Špičková impregnace odpuzuje vodu a chrání povrch před špínou.' },
    { title: 'Nízkotlaké mytí', desc: 'Čistíme šetrně s regulovaným tlakem bez poškození fasádních omítek.' },
    { title: 'Záruka a garance', desc: 'Dlouhodobá záruka na opětovný výskyt organických nečistot.' },
  ],
  roof: [
    { title: 'Všechny typy krytin', desc: 'Čistíme tašky pálené, betonové, plechové, šindel i eternit.' },
    { title: 'Prevence zatékání', desc: 'Odstraněním mechu zamezíme zadržování vody a degradaci krytiny.' },
    { title: 'Hydrofobní ochrana', desc: 'Nano impregnace odpuzuje vodu a poskytuje samočistící efekt.' },
    { title: 'Čištění okapů', desc: 'Součástí každé realizace je vyčištění a kontrola okapových žlabů.' },
  ],
  pavement: [
    { title: 'Odstranění mechu a plevele', desc: 'Vyčistíme zarostlé spáry i hluboko usazené nečistoty.' },
    { title: 'Obnova původního vzhledu', desc: 'Dlažba získá zpět svou barvu a čistý reprezentativní vzhled.' },
    { title: 'Ochrana proti oleji a mastnotě', desc: 'Impregnace zabraňuje vsakování kapalin a usnadňuje údržbu.' },
    { title: 'Doplnění křemičitého písku', desc: 'Po vyčištění a vyschnutí vyplníme spáry novým křemičitým pískem.' },
  ],
}

export function ServiceDetailClient({
  service: initialService,
  beforeAfterItems: initialBeforeAfter,
  galleryPhotos: initialGalleryPhotos,
  serviceFaqs: initialFaqs,
  serviceReviews: initialReviews,
  externalReviews,
  initialProcessSteps,
}: Props) {
  const [activeTab, setActiveTab] = useState<'general' | 'process' | 'photos' | 'faqs' | 'reviews'>('general')
  const [faqs, setFaqs] = useState<ServiceFAQ[]>(initialFaqs)
  const [beforeAfterItems, setBeforeAfterItems] = useState<BeforeAfter[]>(initialBeforeAfter)
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>(initialGalleryPhotos)
  const [serviceReviews, setServiceReviews] = useState<ServiceReview[]>(initialReviews)
  const [service, setService] = useState(() => {
    if (!initialService.features || initialService.features.length === 0) {
      const defaults = DEFAULT_BENEFITS[initialService.slug] || []
      return {
        ...initialService,
        features: defaults.map((d) => JSON.stringify(d)),
      }
    }
    return initialService
  })

  const defaultSteps = [
    { step: '01', title: 'Posouzení', desc: 'Zhodnotíme stav povrchu a navrhneme vhodný čisticí postup.' },
    { step: '02', title: 'Příprava', desc: 'Bezpečně ochraníme okolí a připravíme techniku.' },
    { step: '03', title: 'Realizace', desc: 'Aplikace šetrných čistících přípravků a oplach.' },
    { step: '04', title: 'Impregnace', desc: 'Nanesení finální ochranné nano-impregnace.' },
  ]
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>(
    initialProcessSteps && initialProcessSteps.length > 0 ? initialProcessSteps : defaultSteps
  )
  const [saving, setSaving] = useState(false)

  // --- General save ---
  const handleSaveGeneral = async () => {
    setSaving(true)
    try {
      const { id, ...data } = service
      await updateService(id, data)
      toast.success('Změny uloženy')
    } catch (err) {
      toast.error('Chyba: ' + errorMessage(err))
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
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {service.name}
            </h1>
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
        {(
          [
            { id: 'general', label: 'Základní info', icon: <Layout size={16} /> },
            { id: 'process', label: `Jak to funguje (${processSteps.length})`, icon: <ListOrdered size={16} /> },
            {
              id: 'photos',
              label: `Fotky (${beforeAfterItems.length + galleryPhotos.length})`,
              icon: <Camera size={16} />,
            },
            { id: 'faqs', label: `Q&A (${faqs.length})`, icon: <MessageSquareQuote size={16} /> },
            {
              id: 'reviews',
              label: `Vybrané recenze (${serviceReviews.length})`,
              icon: <MessageSquareQuote size={16} />,
            },
          ] satisfies { id: typeof activeTab; label: string; icon: React.ReactNode }[]
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
            style={{
              background: activeTab === tab.id ? 'var(--bg-surface)' : 'transparent',
              color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              boxShadow: activeTab === tab.id ? 'var(--shadow-sm)' : 'none',
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-8 rounded-3xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        {/* --- GENERAL TAB --- */}
        {activeTab === 'general' && <GeneralTab service={service} setService={setService} />}

        {/* --- PROCESS TAB (Jak to funguje / Krok za krokem) --- */}
        {activeTab === 'process' && (
          <ProcessTab serviceId={service.id} processSteps={processSteps} setProcessSteps={setProcessSteps} />
        )}

        {/* --- PHOTOS TAB --- */}
        {activeTab === 'photos' && (
          <PhotosTab
            serviceId={service.id}
            beforeAfterItems={beforeAfterItems}
            setBeforeAfterItems={setBeforeAfterItems}
            galleryPhotos={galleryPhotos}
            setGalleryPhotos={setGalleryPhotos}
          />
        )}

        {/* --- FAQ TAB --- */}
        {activeTab === 'faqs' && <FaqsTab serviceId={service.id} faqs={faqs} setFaqs={setFaqs} />}

        {/* --- REVIEWS TAB --- */}
        {activeTab === 'reviews' && (
          <ReviewsTab
            serviceId={service.id}
            serviceReviews={serviceReviews}
            setServiceReviews={setServiceReviews}
            externalReviews={externalReviews}
          />
        )}
      </div>
    </div>
  )
}
