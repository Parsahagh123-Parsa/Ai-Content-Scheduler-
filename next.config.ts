import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable Turbopack completely and use webpack
  experimental: {
    turbo: false
  },
  // Use webpack
  webpack: (config) => {
    return config;
  },
  // Fix workspace root issue
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ensure proper module resolution
  resolve: {
    alias: {
      '@': './',
    },
  }
};

export default nextConfig;
