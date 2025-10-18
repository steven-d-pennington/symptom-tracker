import type { NextConfig } from "next";

// Version 0.2.0 - Build timestamp: 2025-10-17
const nextConfig: NextConfig = {
  /* ESLint Configuration */
  // Allow builds to succeed with ESLint warnings
  // TODO: Fix ESLint errors and remove this setting
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },

  /* PWA Configuration */
  // Enable service worker in production
  headers: async () => {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
      {
        source: "/manifest.json",
        headers: [
          {
            key: "Content-Type",
            value: "application/manifest+json",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
