import { createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

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
        <p style={{ marginTop: '12px' }}>Přidej je do <b>Settings &rarr; Environment Variables</b> a dej <b>Redeploy</b>.</p>
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
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex' }}>
      {/* SIDEBAR - Direct Server Component Injection */}
      <aside style={{
        width: '256px',
        background: '#0f172a',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        color: '#94a3b8'
      }}>
        <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', background: '#f59e0b', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: 'white', fontWeight: 'bold' }}>NF</div>
          <div>
            <div style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>NANOfusion</div>
            <div style={{ fontSize: '10px', opacity: 0.5 }}>Admin Panel</div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '24px 0', overflowY: 'auto' }}>
          {[
            { label: 'Dashboard', href: '/admin' },
            { label: 'Poptávky', href: '/admin/inquiries' },
            { label: 'Služby', href: '/admin/services' },
            { label: 'Realizace', href: '/admin/realizations' },
            { label: 'Magazín', href: '/admin/magazine' },
            { label: 'Recenze', href: '/admin/reviews' },
            { label: 'FAQ', href: '/admin/faqs' },
          ].map(item => (
            <a key={item.href} href={item.href} style={{
              display: 'block',
              padding: '12px 24px',
              color: 'inherit',
              textDecoration: 'none',
              fontSize: '14px',
              transition: 'background 0.2s'
            }}>
              {item.label}
            </a>
          ))}
        </nav>

        <div style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: '12px', color: 'white', marginBottom: '4px' }}>{user.email}</div>
          <a href="/admin/login" style={{ color: '#ef4444', fontSize: '12px', textDecoration: 'none' }}>Odhlásit se</a>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div style={{ marginLeft: '256px', width: 'calc(100% - 256px)', minHeight: '100vh' }}>
        <header style={{ height: '64px', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', padding: '0 32px' }}>
          <div style={{ fontSize: '14px', color: '#64748b' }}>Admin / Dashboard</div>
        </header>
        <main style={{ padding: '32px' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
