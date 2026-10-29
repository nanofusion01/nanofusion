'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/supabase/auth-guard'
import { safeAction } from '@/lib/action-result'

export async function deleteUser(id: string) {
  return safeAction(async () => {
    const me = await requireAdmin()
    if (me.id === id) {
      throw new Error('Nemůžete smazat svůj vlastní účet.')
    }

    const supabase = await createAdminClient()

    // profiles.id odkazuje na auth.users bez ON DELETE CASCADE, takže Auth
    // odmítne smazat uživatele, dokud existuje jeho profil. Nejdřív proto
    // smažeme profil (a zapamatujeme si ho), potom uživatele z Auth.
    const { data: profile, error: readError } = await (supabase.from('profiles') as any)
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (readError) throw new Error(readError.message)

    if (profile?.role === 'admin') {
      const { count } = await (supabase.from('profiles') as any)
        .select('id', { count: 'exact', head: true })
        .eq('role', 'admin')
      if ((count ?? 0) <= 1) {
        throw new Error('Nelze smazat posledního administrátora.')
      }
    }

    if (profile) {
      const { error: profileError } = await (supabase.from('profiles') as any)
        .delete()
        .eq('id', id)
      if (profileError) throw new Error(profileError.message)
    }

    const { error: authError } = await supabase.auth.admin.deleteUser(id)
    if (authError && authError.status !== 404) {
      // Smazání z Auth selhalo - vrátíme profil, ať účet nezůstane napůl smazaný
      if (profile) {
        await (supabase.from('profiles') as any).insert(profile)
      }
      throw new Error(`Uživatele se nepodařilo smazat: ${authError.message}`)
    }

    revalidatePath('/admin/users')
  })
}

export async function addUser(email: string) {
  return safeAction(async () => {
    await requireAdmin()
    const supabase = await createAdminClient()

    // Generate a random temporary password
    const tempPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-8).toUpperCase() + '1!';

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { role: 'admin', full_name: email.split('@')[0] }
    })

    if (error) throw new Error(error.message)

    await (supabase.from('profiles') as any).upsert({
      id: data.user.id,
      role: 'admin',
      force_password_change: true
    })

    revalidatePath('/admin/users')
    return tempPassword
  })
}

export async function updateUserRole(id: string, role: 'admin' | 'editor') {
  return safeAction(async () => {
    await requireAdmin()
    const supabase = await createAdminClient()
    const { error } = await (supabase.from('profiles') as any)
      .update({ role })
      .eq('id', id)

    if (error) throw new Error(error.message)
    revalidatePath('/admin/users')
  })
}
