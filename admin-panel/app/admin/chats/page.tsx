import { createClient } from '@/lib/supabase/server'
import { ChatsClient } from './chats-client'
import { oneOf } from '@/lib/utils'

export default async function ChatsPage() {
  const supabase = await createClient()
  const { data: rawSessions } = await supabase
    .from('chat_sessions')
    .select('*')
    .order('last_activity', { ascending: false })

  const sessions = (rawSessions ?? []).map((s) => ({
    ...s,
    status: oneOf(s.status, ['open', 'closed'] as const, 'open'),
  }))

  return <ChatsClient sessions={sessions} />
}
