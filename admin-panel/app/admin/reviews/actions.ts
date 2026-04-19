'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function approveReview(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('external_reviews')
    .update({ approved: true } as any)
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/reviews')
}

export async function rejectReview(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('external_reviews')
    .update({ approved: false } as any)
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/reviews')
}

export async function deleteReview(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('external_reviews')
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
  const { error } = await supabase.from('external_reviews').insert({
    source: 'manual',
    author: data.author,
    rating: data.rating,
    content: data.content,
    approved: true,
    published_at: new Date().toISOString(),
  } as any)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/reviews')
}
