import type { NextConfig } from "next";

// Version 0.5.0 - Build timestamp: 2026-02-15
const nextConfig: NextConfig = {
  /* ESLint Configuration */
  // Allow builds to succeed with ESLint warnings
  // TODO: Fix ESLint errors and remove this setting
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },

  /* Route Redirects - Epic 6 Navigation Restructure */
  // Permanent redirects (308) for renamed routes to preserve bookmarks and links
  // Epic 9: Removed /flares redirect - now using /flares/place for new flare creation flow
  redirects: async () => {
    return [
      {
        source: "/analytics",
        destination: "/insights",
        permanent: true,
      },
      {
        source: "/calendar",
        destination: "/timeline",
        permanent: true,
      },
      {
        source: "/manage",
        destination: "/my-data",
        permanent: true,
      },
      // Deprecated mood/sleep pages redirect to daily log
      {
        source: "/mood",
        destination: "/log",
        permanent: true,
      },
      {
        source: "/sleep",
        destination: "/log",
        permanent: true,
      },
    ];
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
