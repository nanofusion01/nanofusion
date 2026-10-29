'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireAdmin, requireAdminOrEditor } from '@/lib/supabase/auth-guard'

export async function updateInquiryStatus(id: string, status: string, source?: string) {
  await requireAdminOrEditor()
  const supabase = await createAdminClient()
  if (!supabase) throw new Error('Admin client unavailable')
  
  const targetTable = source === 'ai_analyzer' ? 'leads' : 'inquiries'
  const { error } = await (supabase.from(targetTable) as any)
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    
  if (error) throw new Error(error.message)
  
  revalidatePath('/admin/inquiries')
  revalidatePath('/admin/analyzer')
}

export async function updateInquiryNotes(id: string, notes: string, source?: string) {
  await requireAdminOrEditor()
  const supabase = await createAdminClient()
  if (!supabase) throw new Error('Admin client unavailable')
  
  const targetTable = source === 'ai_analyzer' ? 'leads' : 'inquiries'
  const payload = source === 'ai_analyzer' 
    ? { description: notes, updated_at: new Date().toISOString() }
    : { notes, updated_at: new Date().toISOString() }

  const { error } = await (supabase.from(targetTable) as any)
    .update(payload)
    .eq('id', id)
    
  if (error) throw new Error(error.message)
  
  revalidatePath('/admin/inquiries')
  revalidatePath('/admin/analyzer')
}

export async function deleteInquiry(id: string, source?: string) {
  await requireAdminOrEditor()
  const supabase = await createAdminClient()
  if (!supabase) throw new Error('Admin client unavailable')

  const targetTable = source === 'ai_analyzer' ? 'leads' : 'inquiries'
  const { error } = await (supabase.from(targetTable) as any)
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/inquiries')
  revalidatePath('/admin/analyzer')
}

// Smaže vybranou podmnožinu poptávek (checkboxy v UI) - jen tabulka
// inquiries, "leads" z AI Analyzeru se odsud nemažou.
export async function deleteInquiries(ids: string[]) {
  if (ids.length === 0) return
  await requireAdmin()
  const supabase = await createAdminClient()
  if (!supabase) throw new Error('Admin client unavailable')

  const { error } = await (supabase.from('inquiries') as any)
    .delete()
    .in('id', ids)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/inquiries')
  revalidatePath('/admin')
}

// Smaže VŠECHNY poptávky (jen tabulka inquiries - ne "leads" z AI Analyzeru,
// to je samostatná funkce). Určeno pro vyčištění testovacích dat před
// ostrým spuštěním - nevratné, proto vyžaduje potvrzení v UI.
export async function deleteAllInquiries() {
  await requireAdmin()
  const supabase = await createAdminClient()
  if (!supabase) throw new Error('Admin client unavailable')

  const { error } = await (supabase.from('inquiries') as any)
    .delete()
    .not('id', 'is', null)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/inquiries')
  revalidatePath('/admin')
}
