import { createClient } from '@/lib/supabase/server'
import { HeroClient } from './hero-client'
import { SiteStatsCard } from './site-stats-card'
import { oneOf } from '@/lib/utils'
import { SITE_STATS_FIELDS, SITE_STAT_KEYS } from '@/lib/site-stats'

export default async function HeroPage() {
  const supabase = await createClient()

  const [{ data: heroItems }, { data: config }] = await Promise.all([
    supabase.from('hero_media').select('*').order('updated_at', { ascending: false }),
    supabase.from('site_config').select('key, value').in('key', ['hero_title', ...SITE_STAT_KEYS]),
  ])
  const configMap = Object.fromEntries((config ?? []).map((c) => [c.key, c.value ?? '']))

  return (
    <div className="space-y-8">
      <HeroClient
        initialItems={(heroItems ?? []).map((h) => ({ ...h, type: oneOf(h.type, ['image', 'video'] as const, 'image') }))}
        initialTitle={configMap.hero_title || 'Špičková péče o to,<br>co jste usilovně vybudovali'}
      />
      <SiteStatsCard
        initialValues={Object.fromEntries(SITE_STATS_FIELDS.map((f) => [f.key, configMap[f.key] || f.default]))}
      />
    </div>
  )
}
