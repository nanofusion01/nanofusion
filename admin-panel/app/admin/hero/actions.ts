'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateHeroTitle(value: string) {
  const supabase = await createClient()
  const { error } = await (supabase.from('site_config') as any)
    .upsert({ key: 'hero_title', value }, { onConflict: 'key' })
  
  if (error) throw new Error(error.message)
  revalidatePath('/admin/hero')
  revalidatePath('/')
}

export async function toggleHeroMedia(id: string, is_active: boolean) {
  const supabase = await createClient()
  
  if (is_active) {
    await (supabase.from('hero_media') as any).update({ is_active: false }).neq('id', id)
  }

  const { error } = await (supabase.from('hero_media') as any)
    .update({ is_active, updated_at: new Date().toISOString() })
    .eq('id', id)
  
  if (error) throw new Error(error.message)
  revalidatePath('/admin/hero')
  revalidatePath('/')
}

export async function addHeroMedia(url: string, type: 'image' | 'video') {
  const supabase = await createClient()
  const { error } = await (supabase.from('hero_media') as any)
    .insert({ url, type, is_active: false })
  
  if (error) throw new Error(error.message)
  revalidatePath('/admin/hero')
}

export async function deleteHeroMedia(id: string) {
  const supabase = await createClient()
  const { error } = await (supabase.from('hero_media') as any)
    .delete()
    .eq('id', id)
  
  if (error) throw new Error(error.message)
  revalidatePath('/admin/hero')
}
