'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getKnowledgeBase() {
  const supabase = await createAdminClient()
  const { data, error } = await (supabase.from('bot_knowledge') as any)
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Knowledge Base Fetch Error:', error.message)
    // If table doesn't exist yet, just return empty array instead of crashing
    return []
  }
  return data || []
}

export async function saveKnowledge(data: {
  id?: string
  title: string
  content: string
  category?: string
  is_active?: boolean
}) {
  const supabase = await createAdminClient()
  if (data.id) {
    const { error } = await (supabase.from('bot_knowledge') as any)
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', data.id)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await (supabase.from('bot_knowledge') as any).insert([data])
    if (error) throw new Error(error.message)
  }
  revalidatePath('/admin/bot-training')
}

export async function deleteKnowledge(id: string) {
  const supabase = await createAdminClient()
  const { error } = await (supabase.from('bot_knowledge') as any).delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/bot-training')
}

export async function toggleKnowledgeActive(id: string, is_active: boolean) {
  const supabase = await createAdminClient()
  const { error } = await (supabase.from('bot_knowledge') as any)
    .update({ is_active, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/bot-training')
}
