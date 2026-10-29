'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/supabase/auth-guard'

// Akce vrací chybu jako hodnotu místo throw: v produkčním buildu Next.js
// zprávu vyhozené chyby skryje ("An error occurred in the Server Components
// render...") a administrátor by se nedozvěděl, co se stalo.
export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string }

function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : 'Neznámá chyba'
}

export async function deleteUser(id: string): Promise<ActionResult> {
  try {
    const me = await requireAdmin()
    if (me.id === id) {
      return { ok: false, error: 'Nemůžete smazat svůj vlastní účet.' }
    }

    const supabase = await createAdminClient()

    // profiles.id odkazuje na auth.users bez ON DELETE CASCADE, takže Auth
    // odmítne smazat uživatele, dokud existuje jeho profil. Nejdřív proto
    // smažeme profil (a zapamatujeme si ho), potom uživatele z Auth.
    const { data: profile, error: readError } = await (supabase.from('profiles') as any)
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (readError) return { ok: false, error: readError.message }

    if (profile?.role === 'admin') {
      const { count } = await (supabase.from('profiles') as any)
        .select('id', { count: 'exact', head: true })
        .eq('role', 'admin')
      if ((count ?? 0) <= 1) {
        return { ok: false, error: 'Nelze smazat posledního administrátora.' }
      }
    }

    if (profile) {
      const { error: profileError } = await (supabase.from('profiles') as any)
        .delete()
        .eq('id', id)
      if (profileError) return { ok: false, error: profileError.message }
    }

    const { error: authError } = await supabase.auth.admin.deleteUser(id)
    if (authError && authError.status !== 404) {
      // Smazání z Auth selhalo - vrátíme profil, ať účet nezůstane napůl smazaný
      if (profile) {
        await (supabase.from('profiles') as any).insert(profile)
      }
      return { ok: false, error: `Uživatele se nepodařilo smazat: ${authError.message}` }
    }

    revalidatePath('/admin/users')
    return { ok: true }
  } catch (e) {
    return { ok: false, error: errorMessage(e) }
  }
}

export async function addUser(email: string): Promise<ActionResult<string>> {
  try {
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

    if (error) return { ok: false, error: error.message }

    await (supabase.from('profiles') as any).upsert({
      id: data.user.id,
      role: 'admin',
      force_password_change: true
    })

    revalidatePath('/admin/users')
    return { ok: true, data: tempPassword }
  } catch (e) {
    return { ok: false, error: errorMessage(e) }
  }
}

export async function updateUserRole(id: string, role: 'admin' | 'editor'): Promise<ActionResult> {
  try {
    await requireAdmin()
    const supabase = await createAdminClient()
    const { error } = await (supabase.from('profiles') as any)
      .update({ role })
      .eq('id', id)

    if (error) return { ok: false, error: error.message }
    revalidatePath('/admin/users')
    return { ok: true }
  } catch (e) {
    return { ok: false, error: errorMessage(e) }
  }
}
