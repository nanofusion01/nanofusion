import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UsersClient } from './users-client'

export default async function UsersPage() {
  const supabase = await createClient()

  // Check admin role
  const { data: { user } } = await supabase.auth.getUser()
  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user!.id)
    .single()

  if (currentProfile?.role !== 'admin') {
    redirect('/admin')
  }

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <UsersClient 
      initialProfiles={(profiles as any[]) || []} 
      currentUserId={user!.id} 
    />
  )
}
