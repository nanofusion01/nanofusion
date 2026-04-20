import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // basePath removed to prevent /admin/admin/ double-pathing
  // @ts-ignore - Next.js 16 workspace configuration
  turbopack: {
    root: "..",
  },
};

export default nextConfig;
