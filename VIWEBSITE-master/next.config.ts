import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Exclude test files from the build
    if (!isServer) {
      config.module.rules.push({
        test: /\.test\.(js|ts)x?$/, // Matches .test.js, .test.ts, .test.jsx, .test.tsx
        loader: "ignore-loader", // Use ignore-loader to exclude them
      });
    }
    return config;
  },
  // Configure font loading
  images: {
    domains: ['fonts.gstatic.com'],
  },
};

export default nextConfig;
