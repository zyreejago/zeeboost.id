import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['tr.rbxcdn.com'],
  },
  typescript: {
    ignoreBuildErrors: true,  // Mengabaikan error TypeScript saat build
  },
  eslint: {
    ignoreDuringBuilds: true,  // Mengabaikan error ESLint saat build
  },
};

export default nextConfig;
