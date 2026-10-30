import path from "path";
import type { NextConfig } from "next";

// Staré anglické slugy služeb -> nové české (viz app/sluzby/[slug]).
// Trvalé (308) přesměrování, ať staré odkazy/výsledky ve vyhledávačích
// neskončí na 404 místo aby doputovaly na správnou stránku.
const OLD_TO_NEW_SERVICE_SLUG: Record<string, string> = {
  roof: "cisteni-strech",
  pavement: "cisteni-dlazby",
  pv: "cisteni-fotovoltaiky",
  graffiti: "odstraneni-graffiti",
  industrial: "prumyslove-cisteni",
  "facade-paint": "natery-fasad",
  "roof-paint": "natery-strech",
  impregnation: "nano-impregnace",
  antislip: "protiskluzove-natery",
  ceramfloor: "ochrana-podlah-ceramfloor",
  antibac: "antibakterialni-ochrana",
};

const isDev = process.env.NODE_ENV !== "production";
const isPreview = process.env.VERCEL_ENV === "preview";

/**
 * Content-Security-Policy. Zatím jen Report-Only: porušení se hlásí na
 * /api/csp-report (log Vercelu), nic se neblokuje. Obrázky, videa a vložené
 * rámy (YouTube, Google Drive, mapa) přicházejí z obsahu v administraci,
 * proto jsou povolené z libovolného HTTPS zdroje.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}${isPreview ? " https://vercel.live" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' https://*.supabase.co wss://*.supabase.co${isPreview ? " https://vercel.live wss://*.pusher.com" : ""}`,
  "frame-src https:",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "report-uri /api/csp-report",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy-Report-Only", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
];

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, "../"),
  // nevytvářet automaticky AGENTS.md / CLAUDE.md při `next dev`
  agentRules: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return Object.entries(OLD_TO_NEW_SERVICE_SLUG).map(([oldSlug, newSlug]) => ({
      source: `/sluzby/${oldSlug}`,
      destination: `/sluzby/${newSlug}`,
      permanent: true,
    }));
  },
};

export default nextConfig;
