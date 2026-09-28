import type { NextConfig } from "next";

const API_TARGET = process.env.INTERNAL_API_URL || "http://localhost:4000";

const nextConfig: NextConfig = {
  output: "standalone",
  env: {
    NEXT_PUBLIC_STORE_URL: process.env.NEXT_PUBLIC_STORE_URL || "http://localhost:3003",
    NEXT_PUBLIC_PORTAL_URL: process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:3002",
    NEXT_PUBLIC_STUDIO_URL: process.env.NEXT_PUBLIC_STUDIO_URL || "http://localhost:3001",
    NEXT_PUBLIC_WWW_URL: process.env.NEXT_PUBLIC_WWW_URL || "http://localhost:3000",
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_TARGET}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
