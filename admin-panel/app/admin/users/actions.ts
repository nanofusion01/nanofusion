'use server'

import { createAdminClient, createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/supabase/auth-guard'
import { safeAction } from '@/lib/action-result'
import { randomInt } from 'node:crypto'

function generateTempPassword(length = 16): string {
  // bez snadno zaměnitelných znaků (0/O, 1/l/I)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
  const body = Array.from({ length }, () => chars[randomInt(chars.length)]).join('')
  return body + '!' + randomInt(10)
}

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
    const { data: profile, error: readError } = await supabase.from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (readError) throw new Error(readError.message)

    if (profile?.role === 'admin') {
      const { count } = await supabase.from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'admin')
      if ((count ?? 0) <= 1) {
        throw new Error('Nelze smazat posledního administrátora.')
      }
    }

    if (profile) {
      const { error: profileError } = await supabase.from('profiles')
        .delete()
        .eq('id', id)
      if (profileError) throw new Error(profileError.message)
    }

    const { error: authError } = await supabase.auth.admin.deleteUser(id)
    if (authError && authError.status !== 404) {
      // Smazání z Auth selhalo - vrátíme profil, ať účet nezůstane napůl smazaný
      if (profile) {
        await supabase.from('profiles').insert(profile)
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

    // Dočasné heslo z kryptograficky bezpečného generátoru (Math.random() není)
    const tempPassword = generateTempPassword()

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: email.split('@')[0] },
      // Po prvním přihlášení musí uživatel dočasné heslo změnit (hlídá proxy.ts).
      // app_metadata si uživatel sám upravit nemůže.
      app_metadata: { force_password_change: true },
    })

    if (error) throw new Error(error.message)

    // Profil založí trigger handle_new_user (vždy s rolí editor) - pozvaní
    // uživatelé jsou ale administrátoři, takže roli nastavíme explicitně.
    const { error: roleError } = await supabase.from('profiles')
      .upsert({ id: data.user.id, email, role: 'admin' })
    if (roleError) throw new Error(`Účet vytvořen, ale nepodařilo se nastavit roli: ${roleError.message}`)

    revalidatePath('/admin/users')
    return tempPassword
  })
}

export async function updateUserRole(id: string, role: 'admin' | 'editor') {
  return safeAction(async () => {
    await requireAdmin()
    const supabase = await createAdminClient()
    const { error } = await supabase.from('profiles')
      .update({ role })
      .eq('id', id)

    if (error) throw new Error(error.message)
    revalidatePath('/admin/users')
  })
}

// Volá přihlášený uživatel po úspěšné změně hesla na /admin/account.
export async function clearForcePasswordChange() {
  return safeAction(async () => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Nejste přihlášeni.')
    const admin = await createAdminClient()
    const { error } = await admin.auth.admin.updateUserById(user.id, {
      app_metadata: { ...user.app_metadata, force_password_change: false },
    })
    if (error) throw new Error(error.message)
  })
}
