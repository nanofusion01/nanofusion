import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ServiceDetailClient } from './service-detail-client'

export default async function ServiceDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const supabase = await createClient()
  
  const [
    { data: service },
    { data: beforeAfter },
    { data: reviews }
  ] = await Promise.all([
    supabase.from('services').select('*').eq('id', params.id).single(),
    supabase.from('service_before_after').select('*').eq('service_id', params.id).order('order_index'),
    supabase.from('service_reviews').select('*').eq('service_id', params.id).order('created_at', { ascending: false })
  ])

  if (!service) {
    notFound()
  }

  return (
    <ServiceDetailClient 
      service={service} 
      beforeAfterItems={beforeAfter ?? []}
      serviceReviews={reviews ?? []}
    />
  )
}
