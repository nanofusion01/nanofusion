'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function setChatSessionStatus(id: string, status: 'open' | 'closed') {
  const supabase = await createAdminClient()
  if (!supabase) throw new Error('Admin client unavailable')
  const { error } = await (supabase.from('chat_sessions') as any)
    .update({ status })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/chats')
  revalidatePath(`/admin/chats/${id}`)
}

export async function deleteChatSession(id: string) {
  const supabase = await createAdminClient()
  if (!supabase) throw new Error('Admin client unavailable')
  const { error } = await (supabase.from('chat_sessions') as any)
    .delete()
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/chats')
}

// Smaže vybranou podmnožinu chat relací (checkboxy v UI).
export async function deleteChatSessions(ids: string[]) {
  if (ids.length === 0) return
  const supabase = await createAdminClient()
  if (!supabase) throw new Error('Admin client unavailable')
  const { error } = await (supabase.from('chat_sessions') as any)
    .delete()
    .in('id', ids)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/chats')
  revalidatePath('/admin')
}

// Smaže VŠECHNY chat relace. Určeno pro vyčištění testovacích dat před
// ostrým spuštěním - nevratné, proto vyžaduje potvrzení v UI.
export async function deleteAllChatSessions() {
  const supabase = await createAdminClient()
  if (!supabase) throw new Error('Admin client unavailable')
  const { error } = await (supabase.from('chat_sessions') as any)
    .delete()
    .not('id', 'is', null)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/chats')
  revalidatePath('/admin')
}
