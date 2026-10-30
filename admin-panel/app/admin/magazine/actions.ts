'use server'

import { safeAction } from '@/lib/action-result'
import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireAdmin, requireAdminOrEditor } from '@/lib/supabase/auth-guard'
import type { Tables } from '@/lib/database.types'

export async function saveArticle(id: string | null, data: Partial<Tables<'articles'>>) {
  return safeAction(async () => {
    await requireAdminOrEditor()
    const supabase = await createAdminClient()
    
    if (id) {
      // Update — uses 'articles' table (unified with public web)
      const { error } = await supabase.from('articles')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw new Error(error.message)
    } else {
      // Create — uses 'articles' table (unified with public web)
      if (!data.title || !data.slug) throw new Error('Článek musí mít název a adresu (slug).')
      const { error } = await supabase.from('articles')
        .insert({ ...data, title: data.title, slug: data.slug, is_published: false })
      if (error) throw new Error(error.message)
    }
    
    revalidatePath('/admin/magazine')
  })
}

export async function deleteArticle(id: string) {
  return safeAction(async () => {
    await requireAdmin()
    const supabase = await createAdminClient()
    const { error } = await supabase.from('articles').delete().eq('id', id)
    if (error) throw new Error(error.message)
    revalidatePath('/admin/magazine')
  })
}
