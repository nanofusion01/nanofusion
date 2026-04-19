import { createClient } from '@/lib/supabase/server'

export default async function DebugPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user?.id).single()

  return (
    <div className="p-10 font-mono text-xs space-y-4">
      <h1 className="text-xl font-bold">Debug Relace</h1>
      <pre className="p-4 bg-slate-100 rounded">
        USER ID: {user?.id}
        EMAIL: {user?.email}
        ROLE V DATABÁZI: {profile?.role || 'NENALEZENO'}
      </pre>
      <div className="p-4 bg-amber-50 border border-amber-200 rounded">
        <strong>Tip:</strong> Pokud je ROLE "NENALEZENO" nebo není "admin", musíme to v SQL opravit konkrétně pro vaše ID.
      </div>
    </div>
  )
}
