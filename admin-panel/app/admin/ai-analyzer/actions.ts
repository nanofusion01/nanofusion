'use server'

import { safeAction } from '@/lib/action-result'
import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireAdmin, requireAdminOrEditor } from '@/lib/supabase/auth-guard'

export async function updateAnalysisStatus(id: string, status: 'new' | 'in_progress' | 'contacted' | 'resolved') {
  return safeAction(async () => {
    await requireAdminOrEditor()
    const supabase = await createAdminClient()

    const { error } = await supabase
      .from('ai_analyses')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw new Error(error.message)
    revalidatePath('/admin/ai-analyzer')
    revalidatePath('/admin')
  })
}

export async function updateAnalysisNotes(id: string, additional_notes: string) {
  return safeAction(async () => {
    await requireAdminOrEditor()
    const supabase = await createAdminClient()

    const { error } = await supabase
      .from('ai_analyses')
      .update({ additional_notes, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw new Error(error.message)
    revalidatePath('/admin/ai-analyzer')
  })
}

export async function deleteAnalysis(id: string) {
  return safeAction(async () => {
    await requireAdmin()
    const supabase = await createAdminClient()

    const { error } = await supabase.from('ai_analyses').delete().eq('id', id)

    if (error) throw new Error(error.message)
    revalidatePath('/admin/ai-analyzer')
    revalidatePath('/admin')
  })
}
