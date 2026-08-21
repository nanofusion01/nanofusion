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

const nextConfig: NextConfig = {
  async redirects() {
    return Object.entries(OLD_TO_NEW_SERVICE_SLUG).map(([oldSlug, newSlug]) => ({
      source: `/sluzby/${oldSlug}`,
      destination: `/sluzby/${newSlug}`,
      permanent: true,
    }));
  },
};

export default nextConfig;
