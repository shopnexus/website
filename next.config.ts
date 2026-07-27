import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "6c1f-2001-ee0-4f03-8030-66dc-2aab-977e-8816.ngrok-free.app",
  ],
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
};

export default nextConfig;
