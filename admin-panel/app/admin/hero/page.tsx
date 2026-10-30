import { createClient } from '@/lib/supabase/server'
import { HeroClient } from './hero-client'
import { oneOf } from '@/lib/utils'

export default async function HeroPage() {
  const supabase = await createClient()
  
  // Fetch media
  const { data: heroItems } = await supabase.from('hero_media')
    .select('*')
    .order('updated_at', { ascending: false })

  // Fetch site config (hero title)
  const { data: config } = await supabase.from('site_config')
    .select('*')
    .eq('key', 'hero_title')
    .single()

  return (
    <HeroClient 
      initialItems={(heroItems ?? []).map((h) => ({ ...h, type: oneOf(h.type, ['image', 'video'] as const, 'image') }))}
      initialTitle={config?.value || 'Špičková péče o to,<br>co jste usilovně vybudovali'} 
    />
  )
}
