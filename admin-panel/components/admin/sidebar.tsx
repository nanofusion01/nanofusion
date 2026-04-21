'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import {
  LayoutDashboard,
  Image as ImageIcon,
  Wrench,
  HardHat,
  Star,
  Newspaper,
  GalleryHorizontal,
  HelpCircle,
  Calculator,
  MessageSquare,
  ClipboardList,
  Users,
  UserCircle,
  ChevronRight,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  badge?: number
  section?: string
}

const navSections = [
  {
    title: 'Přehled',
    items: [
      {
        label: 'Dashboard',
        href: '/admin',
        icon: <LayoutDashboard size={18} />,
      },
    ],
  },
  {
    title: 'Obsah webu',
    items: [
      {
        label: 'Hero sekce',
        href: '/admin/hero',
        icon: <ImageIcon size={18} />,
      },
      {
        label: 'Naše služby',
        href: '/admin/services',
        icon: <Wrench size={18} />,
      },
      {
        label: 'Realizace',
        href: '/admin/realizations',
        icon: <HardHat size={18} />,
      },
      {
        label: 'Galerie',
        href: '/admin/gallery',
        icon: <GalleryHorizontal size={18} />,
      },
      {
        label: 'Nano-magazín',
        href: '/admin/magazine',
        icon: <Newspaper size={18} />,
      },
      {
        label: 'Časté dotazy',
        href: '/admin/faqs',
        icon: <HelpCircle size={18} />,
      },
    ],
  },
  {
    title: 'Obchod',
    items: [
      {
        label: 'Poptávky',
        href: '/admin/inquiries',
        icon: <ClipboardList size={18} />,
      },
      {
        label: 'Recenze (Firmy.cz)',
        href: '/admin/reviews',
        icon: <Star size={18} />,
      },
      {
        label: 'Konfigurátor & Ceny',
        href: '/admin/configurator',
        icon: <Calculator size={18} />,
      },
      {
        label: 'Chaty (Nanobot)',
        href: '/admin/chats',
        icon: <MessageSquare size={18} />,
      },
    ],
  },
  {
    title: 'Systém',
    items: [
      {
        label: 'Správa přístupu',
        href: '/admin/users',
        icon: <Users size={18} />,
      },
      {
        label: 'Můj účet',
        href: '/admin/account',
        icon: <UserCircle size={18} />,
      },
    ],
  },
]

interface SidebarProps {
  pendingReviews?: number
  userEmail?: string
  userRole?: string
}

export function Sidebar({ pendingReviews = 0, userEmail, userRole }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('Odhlášení proběhlo úspěšně')
    router.push('/admin/login')
    router.refresh()
  }

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <aside
      className="fixed top-0 left-0 h-full flex-col z-50 hidden md:flex"
      style={{
        width: 'var(--sidebar-width)',
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 py-5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div
          className="flex items-center justify-center rounded-lg"
          style={{
            width: 36,
            height: 36,
            background: 'var(--brand-primary)',
            flexShrink: 0,
          }}
        >
          <span className="text-white font-black text-sm">NF</span>
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-tight">NANOfusion</p>
          <p style={{ color: 'var(--sidebar-text)', fontSize: 11 }}>Admin Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navSections.map((section) => (
          <div key={section.title} className="mb-6">
            <p
              className="px-3 mb-2 font-semibold uppercase tracking-wider"
              style={{ fontSize: 10, color: 'rgba(148,163,184,0.5)' }}
            >
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href)
                const isPendingReviews =
                  item.href === '/admin/reviews' && pendingReviews > 0

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group relative',
                        active
                          ? 'text-white'
                          : 'hover:text-white'
                      )}
                      style={{
                        color: active
                          ? 'var(--sidebar-text-active)'
                          : 'var(--sidebar-text)',
                        background: active
                          ? 'var(--sidebar-item-active-bg)'
                          : undefined,
                      }}
                      onMouseEnter={(e) => {
                        if (!active) {
                          e.currentTarget.style.background =
                            'var(--sidebar-item-hover-bg)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!active) {
                          e.currentTarget.style.background = ''
                        }
                      }}
                    >
                      <span
                        style={{
                          color: active
                            ? 'var(--brand-primary)'
                            : 'var(--sidebar-text)',
                        }}
                        className="flex-shrink-0"
                      >
                        {item.icon}
                      </span>
                      <span className="flex-1 truncate">{item.label}</span>
                      {isPendingReviews && (
                        <span
                          className="rounded-full text-white font-bold text-xs px-1.5 py-0.5 min-w-[20px] text-center"
                          style={{ background: 'var(--brand-primary)', fontSize: 10 }}
                        >
                          {pendingReviews}
                        </span>
                      )}
                      {active && (
                        <ChevronRight
                          size={14}
                          style={{ color: 'var(--brand-primary)' }}
                        />
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User Section */}
      <div
        className="p-4"
        style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="flex items-center gap-3 px-2 py-2 mb-2">
          <div
            className="rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
            style={{
              width: 34,
              height: 34,
              background: 'rgba(245, 158, 11, 0.2)',
              color: 'var(--brand-primary)',
            }}
          >
            {userEmail?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {userEmail || 'Admin'}
            </p>
            <p style={{ color: 'var(--sidebar-text)', fontSize: 11 }}>
              {userRole === 'admin' ? 'Administrátor' : 'Editor'}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-colors duration-150"
          style={{ color: '#ef4444' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = ''
          }}
        >
          <LogOut size={16} />
          <span>Odhlásit se</span>
        </button>
      </div>
    </aside>
  )
}
