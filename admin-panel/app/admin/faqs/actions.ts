'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createFaq(data: { question: string; answer: string; order_index: number }) {
  const supabase = await createClient()
  const { error } = await (supabase.from('faqs') as any).insert(data)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/faqs')
}

export async function updateFaq(id: string, data: { question?: string; answer?: string; is_active?: boolean }) {
  const supabase = await createClient()
  const { error } = await (supabase.from('faqs') as any).update(data).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/faqs')
}

export async function deleteFaq(id: string) {
  const supabase = await createClient()
  const { error } = await (supabase.from('faqs') as any).delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/faqs')
}

export async function reorderFaqs(items: { id: string; order_index: number }[]) {
  const supabase = await createClient()
  const updates = items.map(({ id, order_index }) =>
    (supabase.from('faqs') as any).update({ order_index }).eq('id', id)
  )
  await Promise.all(updates)
  revalidatePath('/admin/faqs')
}
