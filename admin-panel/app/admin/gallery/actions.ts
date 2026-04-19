'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addYoutubeItem(url: string, caption?: string) {
  const supabase = await createClient()
  // Extract YouTube ID
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  )
  const youtubeId = match?.[1]
  if (!youtubeId) throw new Error('Neplatná YouTube URL')

  const { count } = await supabase
    .from('gallery_items')
    .select('*', { count: 'exact', head: true })

  await supabase.from('gallery_items').insert({
    type: 'youtube',
    url,
    youtube_id: youtubeId,
    caption: caption || null,
    order_index: count ?? 0,
    is_active: true,
  } as any)
  revalidatePath('/admin/gallery')
}

export async function deleteGalleryItem(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('gallery_items').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/gallery')
}

export async function updateGalleryCaption(id: string, caption: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('gallery_items')
    .update({ caption } as any)
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/gallery')
}

export async function toggleGalleryItemActive(id: string, is_active: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('gallery_items')
    .update({ is_active } as any)
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/gallery')
}
