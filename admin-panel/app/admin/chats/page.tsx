import { createClient } from '@/lib/supabase/server'
import { ChatsClient } from './chats-client'

export default async function ChatsPage() {
  const supabase = await createClient()
  const { data: rawSessions } = await supabase
    .from('chat_sessions')
    .select('*')
    .order('last_activity', { ascending: false })

  const sessions = (rawSessions as any[]) || []

  return <ChatsClient sessions={sessions} />
}
