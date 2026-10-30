import { createClient } from '@/lib/supabase/server'
import { AIAnalyzerClient } from './ai-analyzer-client'
import { oneOf } from '@/lib/utils'

export default async function AIAnalyzerPage() {
  const supabase = await createClient()

  // Fetch all AI analyses ordered by creation date (newest first)
  const { data: analyses } = await supabase.from('ai_analyses').select('*').order('created_at', { ascending: false })

  const STATUSES = ['new', 'in_progress', 'contacted', 'resolved'] as const
  return (
    <AIAnalyzerClient
      initialAnalyses={(analyses ?? []).map((a) => ({ ...a, status: oneOf(a.status, STATUSES, 'new') }))}
    />
  )
}
