import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/admin",
  // @ts-ignore - Next.js 16 workspace configuration
  turbopack: {
    root: "..",
  },
};

export default nextConfig;
