'use server'

import { safeAction } from '@/lib/action-result'
import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireAdmin, requireAdminOrEditor } from '@/lib/supabase/auth-guard'

// Přehled poptávek zobrazuje i AI analýzy (source 'ai_analyzer'), které leží
// v tabulce ai_analyses - poznámky administrátora jsou tam ve sloupci
// additional_notes (stejně jako v sekci AI Analyzér).
const AI_SOURCE = 'ai_analyzer'

export async function updateInquiryStatus(id: string, status: string, source?: string) {
  return safeAction(async () => {
    await requireAdminOrEditor()
    const supabase = await createAdminClient()
    const updated_at = new Date().toISOString()

    const { error } = source === AI_SOURCE
      ? await supabase.from('ai_analyses').update({ status, updated_at }).eq('id', id)
      : await supabase.from('inquiries').update({ status, updated_at }).eq('id', id)

    if (error) throw new Error(error.message)

    revalidatePath('/admin/inquiries')
    revalidatePath('/admin/ai-analyzer')
  })
}

export async function updateInquiryNotes(id: string, notes: string, source?: string) {
  return safeAction(async () => {
    await requireAdminOrEditor()
    const supabase = await createAdminClient()
    const updated_at = new Date().toISOString()

    const { error } = source === AI_SOURCE
      ? await supabase.from('ai_analyses').update({ additional_notes: notes, updated_at }).eq('id', id)
      : await supabase.from('inquiries').update({ notes, updated_at }).eq('id', id)

    if (error) throw new Error(error.message)

    revalidatePath('/admin/inquiries')
    revalidatePath('/admin/ai-analyzer')
  })
}

export async function deleteInquiry(id: string, source?: string) {
  return safeAction(async () => {
    await requireAdminOrEditor()
    const supabase = await createAdminClient()

    const { error } = source === AI_SOURCE
      ? await supabase.from('ai_analyses').delete().eq('id', id)
      : await supabase.from('inquiries').delete().eq('id', id)

    if (error) throw new Error(error.message)

    revalidatePath('/admin/inquiries')
    revalidatePath('/admin/ai-analyzer')
  })
}

// Smaže vybrané řádky přehledu (checkboxy v UI) - poptávky i AI analýzy,
// které uživatel zaškrtl (id jsou UUID, takže se mezi tabulkami nepletou).
export async function deleteInquiries(ids: string[]) {
  return safeAction(async () => {
    if (ids.length === 0) return
    await requireAdmin()
    const supabase = await createAdminClient()
    if (!supabase) throw new Error('Admin client unavailable')

    const { error } = await supabase.from('inquiries')
      .delete()
      .in('id', ids)
    if (error) throw new Error(error.message)

    const { error: aiError } = await supabase.from('ai_analyses')
      .delete()
      .in('id', ids)
    if (aiError) throw new Error(aiError.message)

    revalidatePath('/admin/inquiries')
    revalidatePath('/admin')
  })
}

// Smaže VŠECHNY poptávky (jen tabulka inquiries - AI analýzy zůstanou,
// ty se spravují v sekci AI Analyzér). Určeno pro vyčištění testovacích dat před
// ostrým spuštěním - nevratné, proto vyžaduje potvrzení v UI.
export async function deleteAllInquiries() {
  return safeAction(async () => {
    await requireAdmin()
    const supabase = await createAdminClient()
    if (!supabase) throw new Error('Admin client unavailable')

    const { error } = await supabase.from('inquiries')
      .delete()
      .not('id', 'is', null)

    if (error) throw new Error(error.message)

    revalidatePath('/admin/inquiries')
    revalidatePath('/admin')
  })
}
