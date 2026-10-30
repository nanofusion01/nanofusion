'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { 
  User, 
  Mail, 
  Lock, 
  Fingerprint, 
  Save, 
  Camera,
  ShieldCheck,
  Smartphone,
  Check
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import * as usersActionsRaw from '../users/actions'
import { unwrapActions } from '@/lib/action-result'

const { clearForcePasswordChange } = unwrapActions(usersActionsRaw)

export function AccountClient({ user, profile: initialProfile }: { user: any, profile: any }) {
  const [profile, setProfile] = useState(initialProfile)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const mustChangePassword = Boolean(user?.app_metadata?.force_password_change)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    if (newPassword.length < 8) return setPasswordError('Heslo musí mít alespoň 8 znaků.')
    if (!/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      return setPasswordError('Heslo musí obsahovat velké písmeno a číslici.')
    }
    if (newPassword !== confirmPassword) return setPasswordError('Hesla se neshodují.')

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      if (mustChangePassword) {
        await clearForcePasswordChange()
        toast.success('Heslo bylo změněno, vítejte v administraci')
        // celé načtení, ať proxy uvidí zrušený příznak
        window.location.href = '/admin'
        return
      }
      toast.success('Heslo bylo úspěšně změněno')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      setPasswordError(err.message || 'Heslo se nepodařilo změnit.')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: profile.full_name })
        .eq('id', user.id)
      
      if (error) throw error
      toast.success('Profil uložen')
    } catch (err: any) {
      toast.error('Chyba: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>Můj účet</h1>
        <p className="text-slate-500">Nastavení vašeho administrátorského přístupu</p>
      </div>

      {mustChangePassword && (
        <div className="p-4 rounded-2xl border border-amber-300 bg-amber-50 text-amber-800 text-sm font-semibold">
          Přihlásili jste se dočasným heslem. Než budete pokračovat, nastavte si prosím vlastní heslo.
        </div>
      )}

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-6">
          {/* Profile Card */}
          <div className="p-8 rounded-3xl space-y-8" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div 
                  className="w-24 h-24 rounded-3xl flex items-center justify-center font-black text-3xl shadow-xl border-4 border-white"
                  style={{ background: 'var(--brand-primary)', color: 'white' }}
                >
                  {profile.full_name?.charAt(0) || user.email?.charAt(0)}
                </div>
              </div>
              <div>
                <h3 className="font-bold text-xl">{profile.full_name || 'Uživatel'}</h3>
                <p className="text-slate-500 text-sm flex items-center gap-1.5">
                  <Mail size={14} /> {user.email}
                </p>
                <span 
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest"
                  style={{ background: 'var(--brand-primary-light)', color: 'var(--brand-primary)' }}
                >
                  <ShieldCheck size={12} /> {profile.role}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Celé jméno</label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={profile.full_name || ''}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border outline-none bg-slate-50 focus:bg-white transition-all"
                    style={{ borderColor: 'var(--border)' }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Přihlašovací E-mail</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    type="text"
                    value={user.email}
                    disabled
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border bg-slate-100 text-slate-400 cursor-not-allowed"
                    style={{ borderColor: 'var(--border)' }}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3 rounded-2xl text-sm font-bold text-white shadow-xl shadow-amber-500/20 disabled:opacity-50"
                style={{ background: 'var(--brand-primary)' }}
              >
                <Save size={18} />
                Uložit změny
              </button>
                     </div>
        </div>

        <div className="space-y-6">
           {/* Security Box */}
           <div className="p-6 rounded-3xl border shadow-inner" style={{ background: 'linear-gradient(135deg, #fff 0%, #fffbeb 100%)', borderColor: '#fde68a' }}>
              <Lock size={32} className="text-amber-500 mb-4" />
              <h4 className="font-bold text-lg mb-2">Zabezpečení heslem</h4>
              <p className="text-xs text-amber-700 leading-relaxed mb-6">
                Heslo by mělo obsahovat minimálně 8 znaků, velká písmena a číslice.
              </p>
              <form onSubmit={handleChangePassword} className="space-y-3">
                <input
                  type="password"
                  autoComplete="new-password"
                  placeholder="Nové heslo"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-amber-200 text-sm outline-none focus:border-amber-500"
                />
                <input
                  type="password"
                  autoComplete="new-password"
                  placeholder="Nové heslo znovu"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-amber-200 text-sm outline-none focus:border-amber-500"
                />
                {passwordError && <p className="text-xs font-semibold text-red-600">{passwordError}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-2xl bg-white border border-amber-200 shadow-sm text-sm font-bold text-amber-700 hover:bg-amber-50 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Zpracovávám...' : 'Změnit heslo'}
                </button>
              </form>
           </div>
        </div>
      </div>
    </div>
    </div>
  )
}
