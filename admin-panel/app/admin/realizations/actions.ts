'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createRealization(data: {
  title: string
  description?: string
  location?: string
  duration?: string
  work_type?: string
}) {
  const supabase = await createClient()
  const { data: realization, error } = await supabase
    .from('realizations')
    .insert(data as any)
    .select('id')
    .single()
  if (error) throw new Error(error.message)
  revalidatePath('/admin/realizations')
  return (realization as any).id
}

export async function updateRealization(id: string, data: Partial<{
  title: string
  description: string
  location: string
  duration: string
  work_type: string
  is_published: boolean
}>) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('realizations')
    .update({ ...data, updated_at: new Date().toISOString() } as any)
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/realizations')
}

export async function deleteRealization(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('realizations').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/realizations')
}

export async function togglePublished(id: string, is_published: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('realizations')
    .update({ is_published, updated_at: new Date().toISOString() } as any)
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/realizations')
}

export async function uploadRealizationPhoto(
  realizationId: string,
  file: FormData
) {
  const supabase = await createClient()
  const fileData = file.get('file') as File
  if (!fileData) throw new Error('No file provided')

  const ext = fileData.name.split('.').pop()
  const path = `${realizationId}/${Date.now()}.${ext}`
  const { data, error } = await supabase.storage
    .from('realizations')
    .upload(path, fileData, { cacheControl: '3600', upsert: false })
  if (error) throw new Error(error.message)

  const { data: { publicUrl } } = supabase.storage
    .from('realizations')
    .getPublicUrl(data.path)

  const { count } = await supabase
    .from('realization_photos')
    .select('*', { count: 'exact', head: true })
    .eq('realization_id', realizationId)

  await supabase.from('realization_photos').insert({
    realization_id: realizationId,
    url: publicUrl,
    order_index: count ?? 0,
  } as any)

  revalidatePath('/admin/realizations')
  return publicUrl
}

export async function deleteRealizationPhoto(photoId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('realization_photos')
    .delete()
    .eq('id', photoId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/realizations')
}
