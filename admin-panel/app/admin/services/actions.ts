'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createService(data: { name: string; slug: string }) {
  const supabase = await createClient()
  const { data: service, error } = await (supabase.from('services') as any)
    .insert({ ...data, is_active: true })
    .select('id')
    .single()
  
  if (error) throw new Error(error.message)
  revalidatePath('/admin/services')
  return (service as any).id
}

export async function updateService(id: string, data: any) {
  const supabase = await createClient()
  const { error } = await (supabase.from('services') as any)
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
  
  if (error) throw new Error(error.message)
  revalidatePath('/admin/services')
  revalidatePath(`/admin/services/${id}`)
}

export async function deleteService(id: string) {
  const supabase = await createClient()
  const { error } = await (supabase.from('services') as any).delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/services')
}

export async function toggleServiceStatus(id: string, is_active: boolean) {
  const supabase = await createClient()
  const { error } = await (supabase.from('services') as any)
    .update({ is_active, updated_at: new Date().toISOString() })
    .eq('id', id)
  
  if (error) throw new Error(error.message)
  revalidatePath('/admin/services')
}

export async function reorderServices(items: { id: string; order_index: number }[]) {
  const supabase = await createClient()
  const updates = items.map(({ id, order_index }) =>
    (supabase.from('services') as any).update({ order_index }).eq('id', id)
  )
  await Promise.all(updates)
  revalidatePath('/admin/services')
}
