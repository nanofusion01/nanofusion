'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteUser(id: string) {
  const adminClient = await createAdminClient()
  
  // 1. Delete the user from Auth
  const { error: authError } = await adminClient.auth.admin.deleteUser(id)
  if (authError) throw new Error(authError.message)

  // 2. Delete the profile
  const supabase = await createClient()
  const { error: profileError } = await supabase
    .from('profiles')
    .delete()
    .eq('id', id)
  
  if (profileError) throw new Error(profileError.message)
  
  revalidatePath('/admin/users')
}

export async function addUser(email: string, role: 'admin' | 'editor', password: string) {
  const adminClient = await createAdminClient()
  
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role, full_name: email.split('@')[0] }
  })
  
  if (error) throw new Error(error.message)
  revalidatePath('/admin/users')
}

export async function updateUserRole(id: string, role: 'admin' | 'editor') {
  const supabase = await createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', id)
  
  if (error) throw new Error(error.message)
  revalidatePath('/admin/users')
}
