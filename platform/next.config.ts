import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
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

