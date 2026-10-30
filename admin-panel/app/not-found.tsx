import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-base)' }}>
      <div className="text-center">
        <p className="text-5xl font-black mb-3" style={{ color: 'var(--brand-primary)' }}>
          404
        </p>
        <h1 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
          Stránka neexistuje
        </h1>
        <Link
          href="/admin"
          className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white"
          style={{ background: 'var(--brand-primary)' }}
        >
          Do administrace
        </Link>
      </div>
    </div>
  )
}
