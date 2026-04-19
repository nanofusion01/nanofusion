'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Plus, UserX, Shield, Mail, RefreshCw, Trash2 } from 'lucide-react'
import { addUser, deleteUser, updateUserRole } from './actions'

interface Profile {
  id: string
  email: string | null
  full_name: string | null
  role: 'admin' | 'editor'
  created_at: string
}

export function UsersClient({ initialProfiles, currentUserId }: { initialProfiles: Profile[], currentUserId: string }) {
  const [profiles, setProfiles] = useState(initialProfiles)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [invitePassword, setInvitePassword] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor'>('editor')
  const [loading, setLoading] = useState(false)

  const handleInvite = async () => {
    if (!inviteEmail || !invitePassword) return
    if (invitePassword.length < 6) {
      toast.error('Heslo musí mít aspoň 6 znaků')
      return
    }
    setLoading(true)
    try {
      await addUser(inviteEmail, inviteRole, invitePassword)
      toast.success('Uživatel ' + inviteEmail + ' byl vytvořen')
      setShowInvite(false)
      setInviteEmail('')
      setInvitePassword('')
      // Reload to see the new profile
      window.location.reload()
    } catch (err: any) {
      toast.error('Chyba: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Opravdu chcete smazat uživatele ${email || id}? Tato akce je nevratná.`)) return
    setLoading(true)
    try {
      await deleteUser(id)
      setProfiles(prev => prev.filter(p => p.id !== id))
      toast.success('Uživatel smazán')
    } catch (err: any) {
      toast.error('Chyba: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleToggle = async (id: string, currentRole: 'admin' | 'editor') => {
    const newRole = currentRole === 'admin' ? 'editor' : 'admin'
    try {
      await updateUserRole(id, newRole)
      setProfiles(prev => prev.map(p => p.id === id ? { ...p, role: newRole } : p))
      toast.success('Role aktualizována')
    } catch (err: any) {
      toast.error('Chyba: ' + err.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Správa přístupu</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {profiles.length} uživatelů · jen administrátoři mohou tuto sekci spravovat
          </p>
        </div>
        <button 
          onClick={() => setShowInvite(!showInvite)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg"
          style={{ background: 'var(--brand-primary)' }}
        >
          <Plus size={18} />
          Pozvat uživatele
        </button>
      </div>

      {showInvite && (
        <div className="p-6 rounded-2xl animate-in slide-in-from-top-4 duration-300" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
          <h3 className="font-bold mb-4">Vytvořit nového uživatele</h3>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px] space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-400">E-mailová adresa</label>
              <input 
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="email@nanofusion.cz"
                className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                style={{ borderColor: 'var(--border)', background: 'var(--bg-base)' }}
              />
            </div>
            <div className="flex-1 min-w-[150px] space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-400">Počáteční heslo</label>
              <input 
                type="password"
                value={invitePassword}
                onChange={(e) => setInvitePassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                style={{ borderColor: 'var(--border)', background: 'var(--bg-base)' }}
              />
            </div>
            <div className="w-40 space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-400">Role</label>
              <select 
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                style={{ borderColor: 'var(--border)', background: 'var(--bg-base)' }}
              >
                <option value="editor">Editor</option>
                <option value="admin">Administrátor</option>
              </select>
            </div>
            <button 
              onClick={handleInvite}
              disabled={loading || !inviteEmail || !invitePassword}
              className="px-8 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
              style={{ background: 'var(--brand-primary)' }}
            >
              Vytvořit účet
            </button>
          </div>
        </div>
      )}

      <div className="rounded-2xl overflow-hidden border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-base)' }}>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Uživatel</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Role</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Vytvořen</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400 text-right">Akce</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {profiles.map((p) => (
              <tr key={p.id} className="group hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg" style={{ background: 'var(--brand-primary-light)', color: 'var(--brand-primary)' }}>
                      {p.email?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{p.full_name || p.email?.split('@')[0]}</p>
                      <p className="text-xs text-slate-400">{p.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                   <button 
                    onClick={() => handleRoleToggle(p.id, p.role)}
                    className="group-hover:ring-1 ring-blue-100 rounded-full transition-all"
                   >
                     <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${p.role === 'admin' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                        {p.role}
                     </span>
                   </button>
                </td>
                <td className="px-6 py-4 text-xs text-slate-400">
                  {new Date(p.created_at).toLocaleDateString('cs-CZ')}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => toast.info('Reset hesla byl odeslán na ' + p.email)}
                      className="p-2 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-all"
                      title="Reset hesla"
                    >
                      <RefreshCw size={18} />
                    </button>
                    {p.id !== currentUserId && (
                      <button 
                        onClick={() => handleDelete(p.id, p.email || '')}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                        title="Smazat uživatele"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
