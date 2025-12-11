import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "labaguettemagiquesarttilman.be",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
    // Support local images from public folder
    formats: ['image/webp', 'image/avif'],
    // Disable image optimization for local files if needed (handled per-image with unoptimized prop)
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Suppress Next.js 16 async params warnings (these are React DevTools serialization issues)
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

export default nextConfig;
