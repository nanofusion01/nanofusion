'use server'

import { createClient } from '@/lib/supabase/server'
import { GalleryClient } from './gallery-client'

export default async function GalleryPage() {
  const supabase = await createClient()
  const { data: items } = await (supabase.from('gallery_items') as any)
    .select('*')
    .order('order_index', { ascending: true })

  return <GalleryClient initialItems={(items as any[]) ?? []} />
}
