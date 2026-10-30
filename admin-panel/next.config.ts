import path from 'path'
import type { NextConfig } from 'next'

const publicSiteUrl =
  process.env.NEXT_PUBLIC_PUBLIC_SITE_URL || process.env.PUBLIC_SITE_URL || 'https://nanofusion.vercel.app'

const isDev = process.env.NODE_ENV !== 'production'
const isPreview = process.env.VERCEL_ENV === 'preview'

/**
 * Content-Security-Policy administrace. Zatím jen Report-Only: porušení se
 * hlásí na /api/csp-report (log Vercelu), nic se neblokuje. Náhledy médií
 * (YouTube, Google Drive, obrázky z obsahu) mohou být z libovolného HTTPS zdroje.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}${isPreview ? ' https://vercel.live' : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' https://*.supabase.co wss://*.supabase.co${isPreview ? ' https://vercel.live wss://*.pusher.com' : ''}`,
  'frame-src https:',
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  'report-uri /api/csp-report',
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy-Report-Only', value: csp },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
]

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.resolve(__dirname, '..'),
  turbopack: {
    root: path.resolve(__dirname, '..'),
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'mgmtkdwvhgrzefmyucvr.supabase.co',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
  async redirects() {
    return [
      {
        source: '/poptavka',
        destination: `${publicSiteUrl}/kalkulace`,
        permanent: false,
      },
      {
        source: '/sluzby',
        destination: `${publicSiteUrl}/sluzby`,
        permanent: false,
      },
      {
        source: '/sluzby/:path*',
        destination: `${publicSiteUrl}/sluzby/:path*`,
        permanent: false,
      },
      {
        source: '/faq',
        destination: `${publicSiteUrl}/#faq`,
        permanent: false,
      },
      {
        source: '/o-nas',
        destination: `${publicSiteUrl}/o-nas`,
        permanent: false,
      },
      {
        source: '/gdpr',
        destination: `${publicSiteUrl}/gdpr`,
        permanent: false,
      },
      {
        source: '/obchodni-podminky',
        destination: `${publicSiteUrl}/obchodni-podminky`,
        permanent: false,
      },
    ]
  },
}

export default nextConfig
