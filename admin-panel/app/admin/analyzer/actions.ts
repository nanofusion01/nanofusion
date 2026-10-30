'use server'

import { safeAction } from '@/lib/action-result'
import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireAdminOrEditor } from '@/lib/supabase/auth-guard'

export interface NanoTip {
  id: string
  title: string
  text: string
}

export async function updateAnalyzerTips(tips: NanoTip[]) {
  return safeAction(async () => {
    await requireAdminOrEditor()
    const supabase = await createAdminClient()
    const { error } = await supabase.from('site_config').upsert(
      {
        key: 'nano_tips',
        value: JSON.stringify(tips),
        description: 'NanoTipy zobrazované během AI analýzy',
      },
      { onConflict: 'key' }
    )

    if (error) {
      console.error('Failed to update analyzer tips:', error)
      throw new Error(error.message)
    }

    revalidatePath('/admin/analyzer')
  })
}
