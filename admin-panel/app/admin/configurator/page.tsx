import { createClient } from '@/lib/supabase/server'
import { ConfiguratorClient } from './configurator-client'

export default async function ConfiguratorPage() {
  const supabase = await createClient()

  const [
    { data: prices },
    { data: chatSessions },
    { data: inquiries },
  ] = await Promise.all([
    supabase.from('configurator_prices').select('*').order('label'),
    supabase
      .from('chat_sessions')
      .select('id, user_identifier, status, started_at, last_activity, messages')
      .order('last_activity', { ascending: false })
      .limit(50),
    supabase
      .from('inquiries')
      .select('*')
      .eq('source', 'calculator')
      .order('created_at', { ascending: false }),
  ])

  return (
    <ConfiguratorClient
      initialPrices={prices ?? []}
      initialChatSessions={chatSessions ?? []}
      initialInquiries={inquiries ?? []}
    />
  )
}
