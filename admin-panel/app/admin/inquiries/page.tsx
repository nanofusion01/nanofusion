'use server'

import { createClient } from '@/lib/supabase/server'
import { InquiriesClient } from './inquiries-client'

export default async function InquiriesPage() {
  const supabase = await createClient()
  const { data: inquiries, error } = await (supabase.from('inquiries') as any)
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <InquiriesClient
      initialInquiries={(inquiries as any[]) ?? []}
    />
  )
}
