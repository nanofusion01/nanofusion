import { createAdminClient, createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/admin/sidebar'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 1. Auth check — MUSÍ být přes createClient() s cookies, NE admin client
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  // Nepřihlášený → login stránka (bez sidebaru)
  if (!user || userError) {
    return <>{children}</>
  }

  // 2. DB dotazy přes admin client (bypasses RLS pro profiles/reviews)
  const adminSupabase = await createAdminClient()

  if (!adminSupabase) {
    return (
      <div style={{ padding: '40px', background: '#fef2f2', color: '#991b1b', border: '2px solid #ef4444', margin: '20px', borderRadius: '12px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Chyba konfigurace (Vercel)</h1>
        <p style={{ marginTop: '12px' }}>Admin panel nemá přístup k databázi. Chybí klíče v nastavení Vercelu.</p>
        <ul style={{ marginTop: '12px', listStyle: 'disc', paddingLeft: '20px' }}>
          <li>NEXT_PUBLIC_SUPABASE_URL</li>
          <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
          <li>SUPABASE_SERVICE_ROLE_KEY</li>
        </ul>
        <p style={{ marginTop: '12px' }}>Přidej je do <b>Settings &rarr; Environment Variables</b> a dej <b>Redeploy</b>.</p>
      </div>
    )
  }

  // 3. Fetch / Create profile
  let { data: profile } = await (adminSupabase.from('profiles') as any)
    .select('role, full_name, email')
    .eq('id', user.id)
    .single()

  // Self-healing: user existuje v Auth ale ne v Profiles (trigger selhal)
  if (!profile) {
    const { data: newProfile } = await (adminSupabase.from('profiles') as any)
      .insert({
        id: user.id,
        email: user.email,
        role: 'admin',
        full_name: user.email?.split('@')[0],
      })
      .select()
      .single()
    profile = newProfile
  }

  // 4. Badge na recenzích čekající na schválení
  const { count: pendingReviews } = await (adminSupabase.from('external_reviews') as any)
    .select('*', { count: 'exact', head: true })
    .eq('approved', false)

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex' }}>
      {/* Sidebar */}
      <Sidebar
        pendingReviews={pendingReviews ?? 0}
        userEmail={user.email}
        userRole={(profile as any)?.role ?? 'admin'}
      />

      {/* Main content */}
      <div style={{ marginLeft: '256px', width: 'calc(100% - 256px)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <main style={{ flex: 1, padding: '40px' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
