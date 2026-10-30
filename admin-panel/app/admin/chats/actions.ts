'use server'

import { safeAction } from '@/lib/action-result'
import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireAdmin, requireAdminOrEditor } from '@/lib/supabase/auth-guard'

export async function setChatSessionStatus(id: string, status: 'open' | 'closed') {
  return safeAction(async () => {
    await requireAdminOrEditor()
    const supabase = await createAdminClient()
    const { error } = await supabase.from('chat_sessions').update({ status }).eq('id', id)
    if (error) throw new Error(error.message)
    revalidatePath('/admin/chats')
    revalidatePath(`/admin/chats/${id}`)
  })
}

export async function deleteChatSession(id: string) {
  return safeAction(async () => {
    await requireAdminOrEditor()
    const supabase = await createAdminClient()
    const { error } = await supabase.from('chat_sessions').delete().eq('id', id)
    if (error) throw new Error(error.message)
    revalidatePath('/admin/chats')
  })
}

// Smaže vybranou podmnožinu chat relací (checkboxy v UI).
export async function deleteChatSessions(ids: string[]) {
  return safeAction(async () => {
    if (ids.length === 0) return
    await requireAdminOrEditor()
    const supabase = await createAdminClient()
    const { error } = await supabase.from('chat_sessions').delete().in('id', ids)
    if (error) throw new Error(error.message)
    revalidatePath('/admin/chats')
    revalidatePath('/admin')
  })
}

// Smaže VŠECHNY chat relace. Určeno pro vyčištění testovacích dat před
// ostrým spuštěním - nevratné, proto vyžaduje potvrzení v UI.
export async function deleteAllChatSessions() {
  return safeAction(async () => {
    await requireAdmin()
    const supabase = await createAdminClient()
    const { error } = await supabase.from('chat_sessions').delete().not('id', 'is', null)
    if (error) throw new Error(error.message)
    revalidatePath('/admin/chats')
    revalidatePath('/admin')
  })
}
