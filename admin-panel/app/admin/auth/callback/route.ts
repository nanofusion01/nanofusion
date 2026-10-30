import { NextResponse, type NextRequest } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

/**
 * Cíl odkazu z e-mailu „Zapomenuté heslo“ (a dalších e-mailů Supabase Auth).
 * Vymění jednorázový kód z odkazu za přihlášení a pošle uživatele dál -
 * u resetu hesla na Můj účet, kde si nastaví nové heslo.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const next = searchParams.get('next') ?? '/admin'
  // jen cesty v administraci - žádné přesměrování na cizí web
  const target = next.startsWith('/admin') && !next.startsWith('//') ? next : '/admin'

  const supabase = await createClient()
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null

  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && type
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
      : { error: new Error('Chybí kód v odkazu') }

  if (error) {
    console.warn('auth callback:', error.message)
    return NextResponse.redirect(new URL('/admin/login?chyba=odkaz', origin))
  }
  return NextResponse.redirect(new URL(target, origin))
}
