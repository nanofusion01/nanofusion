'use server'

import { safeAction, unwrapResult } from '@/lib/action-result'
import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { revalidateFrontend } from '@/lib/revalidate-frontend'
import { uploadFile } from '@/lib/storage'
import { requireAdmin, requireAdminOrEditor } from '@/lib/supabase/auth-guard'
import type { Updates } from '@/lib/database.types'

export async function createService(data: { name: string; slug: string }) {
  return safeAction(async () => {
    await requireAdminOrEditor()
    const supabase = await createAdminClient()
    const { data: service, error } = await supabase
      .from('services')
      .insert({ ...data, is_active: true })
      .select('id')
      .single()

    if (error) throw new Error(error.message)
    revalidatePath('/admin/services')
    revalidateFrontend()
    return service.id
  })
}

export async function updateService(id: string, data: Updates<'services'>) {
  return safeAction(async () => {
    await requireAdminOrEditor()
    const supabase = await createAdminClient()
    const { error } = await supabase
      .from('services')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw new Error(error.message)
    revalidatePath('/admin/services')
    revalidatePath(`/admin/services/${id}`)
    revalidateFrontend()
  })
}

export async function deleteService(id: string) {
  return safeAction(async () => {
    await requireAdmin()
    const supabase = await createAdminClient()
    const { error } = await supabase.from('services').delete().eq('id', id)
    if (error) throw new Error(error.message)
    revalidatePath('/admin/services')
    revalidateFrontend()
  })
}

export async function toggleServiceStatus(id: string, is_active: boolean) {
  return safeAction(async () => {
    await requireAdminOrEditor()
    const supabase = await createAdminClient()
    const { error } = await supabase
      .from('services')
      .update({ is_active, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw new Error(error.message)
    revalidatePath('/admin/services')
    revalidateFrontend()
  })
}

export async function reorderServices(items: { id: string; order_index: number }[]) {
  return safeAction(async () => {
    await requireAdminOrEditor()
    const supabase = await createAdminClient()
    const updates = items.map(({ id, order_index }) => supabase.from('services').update({ order_index }).eq('id', id))
    await Promise.all(updates)
    revalidatePath('/admin/services')
    revalidateFrontend()
  })
}

export async function addServiceFaq(serviceId: string, question: string, answer: string) {
  return safeAction(async () => {
    await requireAdminOrEditor()
    const supabase = await createAdminClient()
    const { data, error } = await supabase
      .from('service_faqs')
      .insert({ service_id: serviceId, question, answer })
      .select()
      .single()

    if (error) throw new Error(error.message)
    revalidatePath(`/admin/services/${serviceId}`)
    revalidateFrontend()
    return data
  })
}

export async function updateServiceFaq(id: string, data: Updates<'service_faqs'>) {
  return safeAction(async () => {
    await requireAdminOrEditor()
    const supabase = await createAdminClient()
    const { error } = await supabase.from('service_faqs').update(data).eq('id', id)

    if (error) throw new Error(error.message)
  })
}

export async function deleteServiceFaq(id: string) {
  return safeAction(async () => {
    await requireAdminOrEditor()
    const supabase = await createAdminClient()
    const { error } = await supabase.from('service_faqs').delete().eq('id', id)
    if (error) throw new Error(error.message)
  })
}

// --- Before/After management ---
export async function addBeforeAfter(serviceId: string, beforeUrl: string, afterUrl: string, caption?: string) {
  return safeAction(async () => {
    await requireAdminOrEditor()
    const supabase = await createAdminClient()
    const { count } = await supabase
      .from('service_before_after')
      .select('*', { count: 'exact', head: true })
      .eq('service_id', serviceId)
    const { data, error } = await supabase
      .from('service_before_after')
      .insert({
        service_id: serviceId,
        before_url: beforeUrl,
        after_url: afterUrl,
        caption: caption || '',
        order_index: count ?? 0,
      })
      .select()
      .single()
    if (error) throw new Error(error.message)
    revalidatePath(`/admin/services/${serviceId}`)
    revalidateFrontend()
    return data
  })
}

export async function deleteBeforeAfter(id: string, serviceId: string) {
  return safeAction(async () => {
    await requireAdminOrEditor()
    const supabase = await createAdminClient()
    const { error } = await supabase.from('service_before_after').delete().eq('id', id)
    if (error) throw new Error(error.message)
    revalidatePath(`/admin/services/${serviceId}`)
    revalidateFrontend()
  })
}

export async function uploadServiceFile(serviceId: string, formData: FormData) {
  return safeAction(async () => {
    await requireAdminOrEditor()
    const supabase = await createAdminClient()
    const file = formData.get('file') as File
    if (!file) throw new Error('Chybí soubor')
    return await uploadFile(supabase, file, 'services', `${serviceId}/before-after`)
  })
}

export async function uploadBeforeAfterPhoto(serviceId: string, formData: FormData) {
  return safeAction(async () => {
    await requireAdminOrEditor()
    const supabase = await createAdminClient()
    const beforeFile = formData.get('before') as File
    const afterFile = formData.get('after') as File
    const caption = formData.get('caption') as string | null
    if (!beforeFile || !afterFile) throw new Error('Chybí fotky před nebo po')
    const [beforeUrl, afterUrl] = await Promise.all([
      uploadFile(supabase, beforeFile, 'services', `${serviceId}/before-after`),
      uploadFile(supabase, afterFile, 'services', `${serviceId}/before-after`),
    ])
    return unwrapResult(await addBeforeAfter(serviceId, beforeUrl, afterUrl, caption || ''))
  })
}

export async function uploadServiceHeroImage(serviceId: string, formData: FormData) {
  return safeAction(async () => {
    await requireAdminOrEditor()
    const supabase = await createAdminClient()
    const file = formData.get('file') as File
    if (!file) throw new Error('Chybí soubor')
    const publicUrl = await uploadFile(supabase, file, 'services', serviceId)
    const { error } = await supabase
      .from('services')
      .update({ hero_image_url: publicUrl, updated_at: new Date().toISOString() })
      .eq('id', serviceId)
    if (error) throw new Error(error.message)
    revalidatePath(`/admin/services/${serviceId}`)
    revalidateFrontend()
    return publicUrl
  })
}

export async function uploadServiceVideo(serviceId: string, formData: FormData) {
  return safeAction(async () => {
    await requireAdminOrEditor()
    const supabase = await createAdminClient()
    const file = formData.get('file') as File
    if (!file) throw new Error('Chybí soubor videa')
    const publicUrl = await uploadFile(supabase, file, 'services', `${serviceId}/video`)
    try {
      await supabase
        .from('services')
        .update({ video_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('id', serviceId)
    } catch (e) {
      console.warn('Could not update video_url column directly:', e)
    }
    revalidatePath(`/admin/services/${serviceId}`)
    revalidateFrontend()
    return publicUrl
  })
}

// --- Gallery ("Z realizací") management ---
export async function addGalleryPhoto(serviceId: string, url: string, caption?: string) {
  return safeAction(async () => {
    await requireAdminOrEditor()
    const supabase = await createAdminClient()
    const { count } = await supabase
      .from('service_gallery')
      .select('*', { count: 'exact', head: true })
      .eq('service_id', serviceId)
    const { data, error } = await supabase
      .from('service_gallery')
      .insert({ service_id: serviceId, url, caption: caption || '', order_index: count ?? 0 })
      .select()
      .single()
    if (error) throw new Error(error.message)
    revalidatePath(`/admin/services/${serviceId}`)
    revalidateFrontend()
    return data
  })
}

export async function uploadGalleryPhoto(serviceId: string, formData: FormData) {
  return safeAction(async () => {
    await requireAdminOrEditor()
    const supabase = await createAdminClient()
    const file = formData.get('file') as File
    const caption = formData.get('caption') as string | null
    if (!file) throw new Error('Chybí soubor')
    const url = await uploadFile(supabase, file, 'services', `${serviceId}/gallery`)
    return unwrapResult(await addGalleryPhoto(serviceId, url, caption || ''))
  })
}

export async function deleteGalleryPhoto(id: string, serviceId: string) {
  return safeAction(async () => {
    await requireAdminOrEditor()
    const supabase = await createAdminClient()
    const { error } = await supabase.from('service_gallery').delete().eq('id', id)
    if (error) throw new Error(error.message)
    revalidatePath(`/admin/services/${serviceId}`)
    revalidateFrontend()
  })
}

export async function reorderGalleryPhotos(serviceId: string, items: { id: string; order_index: number }[]) {
  return safeAction(async () => {
    await requireAdminOrEditor()
    const supabase = await createAdminClient()
    const updates = items.map(({ id, order_index }) =>
      supabase.from('service_gallery').update({ order_index }).eq('id', id)
    )
    await Promise.all(updates)
    revalidatePath(`/admin/services/${serviceId}`)
    revalidateFrontend()
  })
}

// --- Service Reviews management ---
export async function addServiceReview(
  serviceId: string,
  author: string,
  rating: number,
  content: string,
  source: string = 'manual'
) {
  return safeAction(async () => {
    await requireAdminOrEditor()
    const supabase = await createAdminClient()
    const { data, error } = await supabase
      .from('service_reviews')
      .insert({ service_id: serviceId, author, rating, content, source, is_visible: true })
      .select()
      .single()

    if (error) throw new Error(error.message)
    revalidatePath(`/admin/services/${serviceId}`)
    revalidateFrontend()
    return data
  })
}

export async function deleteServiceReview(id: string, serviceId: string) {
  return safeAction(async () => {
    await requireAdminOrEditor()
    const supabase = await createAdminClient()
    const { error } = await supabase.from('service_reviews').delete().eq('id', id)

    if (error) throw new Error(error.message)
    revalidatePath(`/admin/services/${serviceId}`)
    revalidateFrontend()
  })
}

// --- Service Process Steps management ---
export async function getServiceProcessSteps(serviceId: string) {
  return safeAction(async () => {
    await requireAdminOrEditor()
    const supabase = await createAdminClient()
    const { data } = await supabase
      .from('site_config')
      .select('value')
      .eq('key', `service_process_${serviceId}`)
      .maybeSingle()

    if (data?.value) {
      try {
        return JSON.parse(data.value)
      } catch {
        return []
      }
    }
    return []
  })
}

export async function saveServiceProcessSteps(
  serviceId: string,
  steps: Array<{ step: string; title: string; desc: string }>
) {
  return safeAction(async () => {
    await requireAdminOrEditor()
    const supabase = await createAdminClient()
    const key = `service_process_${serviceId}`
    const { error } = await supabase.from('site_config').upsert(
      {
        key,
        value: JSON.stringify(steps),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' }
    )

    if (error) throw new Error(error.message)
    revalidatePath(`/admin/services/${serviceId}`)
    revalidateFrontend()
  })
}
