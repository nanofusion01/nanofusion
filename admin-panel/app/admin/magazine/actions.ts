'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveArticle(id: string | null, data: any) {
  const supabase = await createClient()
  
  if (id) {
    // Update
    const { error } = await supabase
      .from('magazine_articles')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw new Error(error.message)
  } else {
    // Create
    const { error } = await supabase
      .from('magazine_articles')
      .insert({ ...data, is_published: false })
    if (error) throw new Error(error.message)
  }
  
  revalidatePath('/admin/magazine')
}

export async function deleteArticle(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('magazine_articles').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/magazine')
}
