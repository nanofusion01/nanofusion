'use client'

import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'

const routeLabels: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/hero': 'Hero sekce',
  '/admin/services': 'Naše služby',
  '/admin/realizations': 'Realizace',
  '/admin/reviews': 'Recenze (Firmy.cz)',
  '/admin/magazine': 'Nano-magazín',
  '/admin/gallery': 'Galerie',
  '/admin/faqs': 'Časté dotazy',
  '/admin/configurator': 'Konfigurátor & Ceny',
  '/admin/chats': 'Chaty (Nanobot)',
  '/admin/inquiries': 'Poptávky',
  '/admin/users': 'Správa přístupu',
  '/admin/account': 'Můj účet',
}

export function AdminHeader() {
  const pathname = usePathname()

  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs: { label: string; href: string }[] = []

  let currentPath = ''
  for (const segment of segments) {
    currentPath += `/${segment}`
    const label = routeLabels[currentPath]
    if (label) {
      breadcrumbs.push({ label, href: currentPath })
    } else {
      // Capitalize fallback
      breadcrumbs.push({
        label: segment.charAt(0).toUpperCase() + segment.slice(1),
        href: currentPath,
      })
    }
  }

  const currentPageLabel =
    routeLabels[pathname] ||
    (pathname.split('/').pop() || 'Dashboard')

  return (
    <header
      className="fixed top-0 right-0 flex items-center px-6 bg-white z-40"
      style={{
        left: 'var(--sidebar-width)',
        height: 'var(--header-height)',
        borderBottom: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div className="flex items-center gap-1.5 text-sm">
        <Home size={14} style={{ color: 'var(--text-muted)' }} />
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.href} className="flex items-center gap-1.5">
            <ChevronRight size={12} style={{ color: 'var(--text-muted)' }} />
            <span
              style={{
                color:
                  i === breadcrumbs.length - 1
                    ? 'var(--text-primary)'
                    : 'var(--text-muted)',
                fontWeight: i === breadcrumbs.length - 1 ? 600 : 400,
              }}
            >
              {crumb.label}
            </span>
          </span>
        ))}
      </div>
    </header>
  )
}
