import path from "path";
import type { NextConfig } from "next";

const publicSiteUrl = process.env.NEXT_PUBLIC_PUBLIC_SITE_URL || process.env.PUBLIC_SITE_URL || 'https://nanofusion.vercel.app';

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
    ];
  },
};

export default nextConfig;
