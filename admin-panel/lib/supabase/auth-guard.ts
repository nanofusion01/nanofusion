import { createClient, createAdminClient } from '@/lib/supabase/server'

export interface AuthUser {
  id: string
  email?: string
  role: 'admin' | 'editor'
  full_name?: string
}

/**
 * Ověří, zda je volající přihlášen a má roli 'admin' nebo 'editor'.
 * Vyhodí Error, pokud uživatel není přihlášen nebo nemá potřebná oprávnění.
 */
export async function requireAdminOrEditor(): Promise<AuthUser> {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (!user || userError) {
    throw new Error('Neautorizovaný přístup: Pro tuto operaci se musíte přihlásit.')
  }

  // Získáme profil uživatele přes adminClient, aby byla role ověřena přímo v DB
  const adminClient = await createAdminClient()
  const { data: profile, error: profileError } = await (adminClient.from('profiles') as any)
    .select('id, role, full_name, email')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    throw new Error('Profil uživatele nebyl nalezen nebo k němu nemáte přístup.')
  }

  const role = profile.role as 'admin' | 'editor'
  if (role !== 'admin' && role !== 'editor') {
    throw new Error('Nemáte dostatečná oprávnění pro tuto akci.')
  }

  return {
    id: user.id,
    email: user.email,
    role,
    full_name: profile.full_name,
  }
}

/**
 * Ověří, zda je volající přihlášen a má striktně roli 'admin'.
 * Vyhodí Error pro nepřihlášené uživatele i pro editory.
 */
export async function requireAdmin(): Promise<AuthUser> {
  const authUser = await requireAdminOrEditor()
  if (authUser.role !== 'admin') {
    throw new Error('Tato operace vyžaduje administrátorská oprávnění.')
  }
  return authUser
}

