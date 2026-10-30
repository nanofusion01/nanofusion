import { createClient } from '@/lib/supabase/server'
import { HowItWorksClient } from './how-it-works-client'

export default async function HowItWorksPage() {
  const supabase = await createClient()

  // Fetch section header
  const { data: section } = await supabase.from('site_sections').select('*').eq('section_key', 'how_it_works').single()

  // Fetch steps
  const { data: steps } = await supabase
    .from('how_it_works_steps')
    .select('*')
    .order('order_index', { ascending: true })

  return (
    <HowItWorksClient
      initialSection={{
        title: section?.title ?? 'Jak to funguje',
        subtitle: section?.subtitle ?? '3 jednoduché kroky ke změně',
      }}
      initialSteps={(steps ?? []).map((s) => ({
        id: s.id,
        step_number: s.step_number ?? '',
        title: s.title,
        description: s.description ?? '',
        icon: s.icon ?? '',
        order_index: s.order_index ?? 0,
      }))}
    />
  )
}
