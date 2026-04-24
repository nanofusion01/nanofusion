'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { uploadFile } from '@/lib/storage'

export async function createRealization(data: {
  title: string
  description?: string
  location?: string
  duration?: string
  work_type?: string
}) {
  const supabase = await createAdminClient()
  const { data: realization, error } = await (supabase.from('realizations') as any)
    .insert(data)
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
  const supabase = await createAdminClient()
  const { error } = await (supabase.from('realizations') as any)
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/realizations')
}

export async function deleteRealization(id: string) {
  const supabase = await createAdminClient()
  const { error } = await (supabase.from('realizations') as any).delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/realizations')
}

export async function togglePublished(id: string, is_published: boolean) {
  const supabase = await createAdminClient()
  const { error } = await (supabase.from('realizations') as any)
    .update({ is_published, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/realizations')
}

export async function uploadRealizationPhoto(
  realizationId: string,
  file: FormData
) {
  const supabase = await createAdminClient()
  const fileData = file.get('file') as File
  if (!fileData) throw new Error('No file provided')

  const publicUrl = await uploadFile(supabase, fileData, 'realizations', realizationId)

  const { count } = await (supabase.from('realization_photos') as any)
    .select('*', { count: 'exact', head: true })
    .eq('realization_id', realizationId)

  const { error: dbError } = await (supabase.from('realization_photos') as any).insert({
    realization_id: realizationId,
    url: publicUrl,
    order_index: count ?? 0,
  })

  if (dbError) throw new Error(`Database write failed: ${dbError.message}`)

  revalidatePath('/admin/realizations')
  return publicUrl
}

export async function deleteRealizationPhoto(photoId: string) {
  const supabase = await createAdminClient()
  const { error } = await (supabase.from('realization_photos') as any)
    .delete()
    .eq('id', photoId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/realizations')
}
