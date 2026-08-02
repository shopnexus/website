import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit .next/standalone/server.js — a self-contained server with only the
  // traced dependencies, so the runtime image needs no node_modules install.
  output: "standalone",
  images: {
    remotePatterns: [
      {
        // Placeholder images: picsum.photos/seed/<id>/<w>/<h>
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://shopnexus.hopto.org/api/v1';
    return [
      {
        source: '/api/v1/:path*',
        destination: `${apiUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
