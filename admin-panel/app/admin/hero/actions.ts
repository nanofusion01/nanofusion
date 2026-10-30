'use server'

import { safeAction } from '@/lib/action-result'
import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { uploadFile } from '@/lib/storage'
import { requireAdminOrEditor } from '@/lib/supabase/auth-guard'
import { revalidateFrontend } from '@/lib/revalidate-frontend'
import { SITE_STAT_KEYS } from '@/lib/site-stats'

export async function uploadHeroFile(formData: FormData) {
  return safeAction(async () => {
    await requireAdminOrEditor()
    const supabase = await createAdminClient()
    const file = formData.get('file') as File
    if (!file) throw new Error('Chybí soubor')
    const publicUrl = await uploadFile(supabase, file, 'heroes', 'hero')
    const { error } = await supabase
      .from('hero_media')
      .insert({ url: publicUrl, type: file.type.startsWith('video/') ? 'video' : 'image', is_active: false })
    if (error) throw new Error(error.message)
    revalidatePath('/admin/hero')
    return publicUrl
  })
}

export async function updateHeroTitle(value: string) {
  return safeAction(async () => {
    await requireAdminOrEditor()
    const supabase = await createAdminClient()
    const { error } = await supabase.from('site_config').upsert({ key: 'hero_title', value }, { onConflict: 'key' })

    if (error) throw new Error(error.message)
    revalidatePath('/admin/hero')
    await revalidateFrontend()
  })
}

export async function toggleHeroMedia(id: string, is_active: boolean) {
  return safeAction(async () => {
    await requireAdminOrEditor()
    const supabase = await createAdminClient()

    if (is_active) {
      await supabase.from('hero_media').update({ is_active: false }).neq('id', id)
    }

    const { error } = await supabase
      .from('hero_media')
      .update({ is_active, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw new Error(error.message)
    revalidatePath('/admin/hero')
    await revalidateFrontend()
  })
}

export async function addHeroMedia(url: string, type: 'image' | 'video') {
  return safeAction(async () => {
    await requireAdminOrEditor()
    const supabase = await createAdminClient()
    const { error } = await supabase.from('hero_media').insert({ url, type, is_active: false })

    if (error) throw new Error(error.message)
    revalidatePath('/admin/hero')
  })
}

export async function deleteHeroMedia(id: string) {
  return safeAction(async () => {
    await requireAdminOrEditor()
    const supabase = await createAdminClient()
    const { error } = await supabase.from('hero_media').delete().eq('id', id)

    if (error) throw new Error(error.message)
    revalidatePath('/admin/hero')
  })
}

/** Uloží čísla zobrazovaná na webu (počet projektů, hodnocení…). */
export async function updateSiteStats(values: Record<string, string>) {
  return safeAction(async () => {
    await requireAdminOrEditor()
    const rows = Object.entries(values)
      .filter(([key]) => SITE_STAT_KEYS.includes(key))
      .map(([key, value]) => ({ key, value: String(value).trim().slice(0, 30) }))
    if (rows.length === 0) throw new Error('Nic k uložení')
    const supabase = await createAdminClient()
    const { error } = await supabase.from('site_config').upsert(rows, { onConflict: 'key' })
    if (error) throw new Error(error.message)
    revalidatePath('/admin/hero')
    await revalidateFrontend()
  })
}
