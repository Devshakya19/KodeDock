import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: { ignoreBuildErrors: false },
  reactStrictMode: true,
  images: {
    qualities: [75, 90],
  },
};

export default nextConfig;
