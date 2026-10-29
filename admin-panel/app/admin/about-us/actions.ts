'use server'

import { safeAction } from '@/lib/action-result'
import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireAdminOrEditor } from '@/lib/supabase/auth-guard'

export async function updateAboutConfig(key: string, value: string) {
  return safeAction(async () => {
    await requireAdminOrEditor()
    const supabase = await createAdminClient()
    const { error } = await (supabase.from('site_config') as any)
      .upsert({ key, value }, { onConflict: 'key' })
    
    if (error) throw new Error(error.message)
    revalidatePath('/admin/about-us')
    revalidatePath('/')
  })
}
