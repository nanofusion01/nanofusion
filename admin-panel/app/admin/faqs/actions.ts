'use server'

import { safeAction } from '@/lib/action-result'
import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireAdmin, requireAdminOrEditor } from '@/lib/supabase/auth-guard'

export async function createFaq(data: { question: string; answer: string; order_index: number; page_section?: string }) {
  return safeAction(async () => {
    await requireAdminOrEditor()
    const supabase = await createAdminClient()
    const { error } = await supabase.from('faqs').insert(data)
    if (error) throw new Error(error.message)
    revalidatePath('/admin/faqs')
    revalidatePath('/faq')
    revalidatePath('/')
  })
}

export async function updateFaq(id: string, data: { question?: string; answer?: string; is_active?: boolean; page_section?: string }) {
  return safeAction(async () => {
    await requireAdminOrEditor()
    const supabase = await createAdminClient()
    const { error } = await supabase.from('faqs').update(data).eq('id', id)
    if (error) throw new Error(error.message)
    revalidatePath('/admin/faqs')
    revalidatePath('/faq')
    revalidatePath('/')
  })
}

export async function deleteFaq(id: string) {
  return safeAction(async () => {
    await requireAdmin()
    const supabase = await createAdminClient()
    const { error } = await supabase.from('faqs').delete().eq('id', id)
    if (error) throw new Error(error.message)
    revalidatePath('/admin/faqs')
    revalidatePath('/faq')
    revalidatePath('/')
  })
}

export async function reorderFaqs(items: { id: string; order_index: number }[]) {
  return safeAction(async () => {
    await requireAdminOrEditor()
    const supabase = await createAdminClient()
    const updates = items.map(({ id, order_index }) =>
      supabase.from('faqs').update({ order_index }).eq('id', id)
    )
    await Promise.all(updates)
    revalidatePath('/admin/faqs')
    revalidatePath('/faq')
    revalidatePath('/')
  })
}
