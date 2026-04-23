'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { uploadFile } from '@/lib/storage'

export async function addYoutubeItem(url: string, caption?: string) {
  const supabase = await createClient()
  // Extract YouTube ID
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  )
  const youtubeId = match?.[1]
  if (!youtubeId) throw new Error('Neplatná YouTube URL')

  const { count } = await (supabase.from('gallery_items') as any)
    .select('*', { count: 'exact', head: true })

  await (supabase.from('gallery_items') as any).insert({
    type: 'youtube',
    url,
    youtube_id: youtubeId,
    caption: caption || null,
    order_index: count ?? 0,
    is_active: true,
  })
  revalidatePath('/admin/gallery')
}

export async function addImageItem(url: string, caption?: string) {
  const supabase = await createClient()

  const { count } = await (supabase.from('gallery_items') as any)
    .select('*', { count: 'exact', head: true })

  await (supabase.from('gallery_items') as any).insert({
    type: 'image',
    url,
    caption: caption || null,
    order_index: count ?? 0,
    is_active: true,
  })
  revalidatePath('/admin/gallery')
}

export async function uploadGalleryImage(file: FormData) {
  const supabase = await createClient()
  const fileData = file.get('file') as File
  if (!fileData) throw new Error('No file provided')

  const publicUrl = await uploadFile(supabase, fileData, 'gallery', 'items')
  await addImageItem(publicUrl, file.get('caption') as string | undefined)
  return publicUrl
}

export async function deleteGalleryItem(id: string) {
  const supabase = await createClient()
  const { error } = await (supabase.from('gallery_items') as any).delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/gallery')
}

export async function updateGalleryCaption(id: string, caption: string) {
  const supabase = await createClient()
  const { error } = await (supabase.from('gallery_items') as any)
    .update({ caption })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/gallery')
}

export async function toggleGalleryItemActive(id: string, is_active: boolean) {
  const supabase = await createClient()
  const { error } = await (supabase.from('gallery_items') as any)
    .update({ is_active })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/gallery')
}
