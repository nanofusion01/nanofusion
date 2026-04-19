import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/admin/sidebar'
import { AdminHeader } from '@/components/admin/header'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

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
          marginLeft: 'var(--sidebar-width)',
          paddingTop: 'var(--header-height)',
          minHeight: '100vh',
        }}
      >
        <div className="p-6 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  )
}
