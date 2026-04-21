'use server'

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ServiceDetailClient } from './service-detail-client'

export default async function ServiceDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const supabase = await createClient()
  
  const [
    { data: service },
    { data: beforeAfter },
    { data: serviceFaqs }
  ] = await Promise.all([
    (supabase.from('services') as any).select('*').eq('id', params.id).single(),
    (supabase.from('service_before_after') as any).select('*').eq('service_id', params.id).order('order_index'),
    (supabase.from('service_faqs') as any).select('*').eq('service_id', params.id).order('order_index')
  ])

  if (!service) {
    notFound()
  }

  return (
    <ServiceDetailClient 
      service={service as any} 
      beforeAfterItems={(beforeAfter as any[]) ?? []}
      serviceFaqs={(serviceFaqs as any[]) ?? []}
    />
  )
}
