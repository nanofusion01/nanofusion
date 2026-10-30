import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/database.types'
import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js"

/**
 * Jsou nastavené proměnné prostředí pro Supabase? Layout podle toho ukáže
 * chybu konfigurace. `withServiceRole` ověří i klíč pro serverové operace.
 */
export function isSupabaseConfigured({ withServiceRole = false } = {}): boolean {
  const base = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  return withServiceRole ? base && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY) : base
}

function missingEnv(name: string): never {
  throw new Error(`Chybí proměnná prostředí ${name} (viz admin-panel/.env.example).`)
}

export async function createClient(): Promise<SupabaseClient<Database>> {
  const cookieStore = await cookies()

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url) missingEnv('NEXT_PUBLIC_SUPABASE_URL')
  if (!key) missingEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

  return createServerClient<Database>(url, key, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Ignore cookie errors in Server Components
          }
        },
      },
    }
  )
}

/** Klient se service role klíčem (obchází RLS) – jen na serveru, vždy až po requireAdmin*. */
export async function createAdminClient(): Promise<SupabaseClient<Database>> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url) missingEnv('NEXT_PUBLIC_SUPABASE_URL')
  if (!serviceKey) missingEnv('SUPABASE_SERVICE_ROLE_KEY')

  return createSupabaseClient<Database>(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
