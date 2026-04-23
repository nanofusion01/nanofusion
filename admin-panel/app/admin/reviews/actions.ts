'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function approveReview(id: string) {
  const supabase = await createClient()
  const { error } = await (supabase.from('external_reviews') as any)
    .update({ approved: true })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/reviews')
}

export async function rejectReview(id: string) {
  const supabase = await createClient()
  const { error } = await (supabase.from('external_reviews') as any)
    .update({ approved: false })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/reviews')
}

export async function deleteReview(id: string) {
  const supabase = await createClient()
  const { error } = await (supabase.from('external_reviews') as any)
    .delete()
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/reviews')
}

export async function addManualReview(data: {
  author: string
  rating: number
  content: string
}) {
  const supabase = await createClient()
  const { error } = await (supabase.from('external_reviews') as any).insert({
    source: 'manual',
    author: data.author,
    rating: data.rating,
    content: data.content,
    approved: true,
    published_at: new Date().toISOString(),
  })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/reviews')
}

// TASK 9: Schválení recenze z Firmy.cz — kopíruje záznam do external_reviews
export async function approveFirmyReview(firmyReviewId: string) {
  const supabase = await createAdminClient()
  if (!supabase) throw new Error('Admin client unavailable')

  // Načti recenzi z firmy_reviews
  const { data: review, error: fetchError } = await (supabase.from('firmy_reviews') as any)
    .select('*')
    .eq('id', firmyReviewId)
    .single()

  if (fetchError || !review) throw new Error('Recenze nenalezena')

  // Upsert do external_reviews s approved = true (public web čte z této tabulky)
  const { error } = await (supabase.from('external_reviews') as any)
    .upsert({
      source: 'firmy.cz',
      external_id: review.external_id || firmyReviewId,
      author: review.author_name,
      rating: review.rating,
      content: review.content,
      published_at: review.review_date,
      approved: true,
    }, { onConflict: 'external_id' })

  if (error) throw new Error(error.message)
  revalidatePath('/admin/reviews')
}
