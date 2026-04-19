'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateHeroTitle(value: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('site_config')
    .upsert({ key: 'hero_title', value } as any, { onConflict: 'key' })
  
  if (error) throw new Error(error.message)
  revalidatePath('/admin/hero')
}

export async function toggleHeroMedia(id: string, is_active: boolean) {
  const supabase = await createClient()
  
  // If activating, deactivate others
  if (is_active) {
    await supabase.from('hero_media').update({ is_active: false } as any).neq('id', id)
  }

  const { error } = await supabase
    .from('hero_media')
    .update({ is_active, updated_at: new Date().toISOString() } as any)
    .eq('id', id)
  
  if (error) throw new Error(error.message)
  revalidatePath('/admin/hero')
}
