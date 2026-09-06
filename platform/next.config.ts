import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/auth",
        destination: "/login",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;

