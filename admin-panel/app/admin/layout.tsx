import { createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/admin/sidebar'
import { AdminHeader } from '@/components/admin/header'
import { MobileNav } from '@/components/admin/mobile-nav'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createAdminClient()

  if (!supabase) {
    return (
      <div style={{ padding: '40px', background: '#fef2f2', color: '#991b1b', border: '2px solid #ef4444', margin: '20px', borderRadius: '12px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Chyba konfigurace (Vercel)</h1>
        <p style={{ marginTop: '12px' }}>Admin panel nemá přístup k databázi. Chybí klíče v nastavení Vercelu.</p>
        <ul style={{ marginTop: '12px', listStyle: 'disc', paddingLeft: '20px' }}>
          <li>NEXT_PUBLIC_SUPABASE_URL</li>
          <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
          <li>SUPABASE_SERVICE_ROLE_KEY</li>
        </ul>
        <p style={{ marginTop: '12px' }}>Přidej je do <b>Settings -> Environment Variables</b> a dej <b>Redeploy</b>.</p>
      </div>
    )
  }

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  // Guard: If no user or error fetching user, only show the children (login page)
  if (!user || userError) {
    return <>{children}</>
  }

  // Fetch / Create profile
  let { data: profile } = await (supabase.from('profiles') as any)
    .select('role, full_name, email')
    .eq('id', user.id)
    .single()

  // Self-healing: If user exists in Auth but not in Profiles table (trigger failed)
  if (!profile) {
    const { data: newProfile } = await (supabase.from('profiles') as any)
      .insert({
        id: user.id,
        email: user.email,
        role: 'admin', // First manual users are admins
        full_name: user.email?.split('@')[0]
      })
      .select()
      .single()
    profile = newProfile
  }

  // Fetch pending reviews count
  const { count: pendingReviews } = await (supabase.from('external_reviews') as any)
    .select('*', { count: 'exact', head: true })
    .eq('approved', false)

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <Sidebar
        pendingReviews={pendingReviews ?? 0}
        userEmail={profile?.email ?? user.email}
        userRole={profile?.role ?? 'admin'}
      />
      <AdminHeader />
      <main
        className="transition-all duration-200"
        style={{
          paddingTop: 'var(--header-height)',
          minHeight: '100vh',
        }}
      >
        <div className="md:ml-[var(--sidebar-width)] p-4 md:p-8 pb-24 md:pb-8 animate-fade-in">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  )
}
