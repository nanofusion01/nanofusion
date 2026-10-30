import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ServiceDetailClient } from './service-detail-client'

export default async function ServiceDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const supabase = await createClient()

  const [
    { data: service },
    { data: beforeAfter },
    { data: galleryPhotos },
    { data: serviceReviews },
    { data: externalReviews },
  ] = await Promise.all([
    supabase.from('services').select('*').eq('id', params.id).single(),
    supabase.from('service_before_after').select('*').eq('service_id', params.id).order('order_index'),
    supabase.from('service_gallery').select('*').eq('service_id', params.id).order('order_index'),
    supabase.from('service_reviews').select('*').eq('service_id', params.id).order('created_at', { ascending: false }),
    supabase.from('external_reviews').select('*').eq('approved', true).order('published_at', { ascending: false }),
  ])

  if (!service) {
    notFound()
  }

  const [{ data: serviceSpecificFaqs }, { data: globalSectionFaqs }, { data: processConfig }] = await Promise.all([
    supabase.from('service_faqs').select('*').eq('service_id', params.id).order('order_index'),
    supabase.from('faqs').select('*').eq('page_section', service.slug).order('order_index'),
    supabase.from('site_config').select('value').eq('key', `service_process_${params.id}`).maybeSingle(),
  ])

  // Merge them for the client
  const allFaqs = [
    ...(serviceSpecificFaqs ?? []),
    // obecné FAQ z tabulky faqs (sekce dané služby) ve tvaru FAQ služby
    ...(globalSectionFaqs ?? []).map((f) => ({
      id: f.id,
      service_id: params.id,
      question: f.question,
      answer: f.answer,
      order_index: f.order_index,
      is_active: f.is_active,
      created_at: '',
      is_global: true,
    })),
  ]

  let initialProcessSteps: Array<{ step: string; title: string; desc: string }> = []
  if (processConfig?.value) {
    try {
      initialProcessSteps = JSON.parse(processConfig.value)
    } catch {
      initialProcessSteps = []
    }
  }

  return (
    <ServiceDetailClient
      service={service}
      beforeAfterItems={beforeAfter ?? []}
      galleryPhotos={galleryPhotos ?? []}
      serviceFaqs={allFaqs}
      serviceReviews={serviceReviews ?? []}
      externalReviews={externalReviews ?? []}
      initialProcessSteps={initialProcessSteps}
    />
  )
}
