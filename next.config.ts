import type { NextConfig } from "next"

const nextConfig: NextConfig = {
	// Emit .next/standalone/server.js — a self-contained server with only the
	// traced dependencies, so the runtime image needs no node_modules install.
	output: "standalone",
	allowedDevOrigins: ["shopnexus.hopto.org", "shop.toanehihi.io.vn"],
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
			{
				protocol: "https",
				hostname: "shopnexus.hopto.org",
			},
			{
				protocol: "https",
				hostname: "cdn.shopnexus.vn",
			},
			{ protocol: "https", hostname: "**.susercontent.com" },
			{ protocol: "https", hostname: "shopnexus.hopto.org" },
		],
	},
	// Support used to be its own screen. A ticket is a conversation, so it is read in the
	// inbox now — old links and bookmarks land on the tab that holds them, query intact.
	async redirects() {
		return [
			{ source: "/support", destination: "/inbox?tab=support", permanent: true },
			{ source: "/support/:path*", destination: "/inbox?tab=support", permanent: true },
		]
	},
	async rewrites() {
		const apiUrl =
			process.env.NEXT_PUBLIC_API_URL || "https://shopnexus.hopto.org/api/v1"
		return [
			{
				source: "/api/v1/:path*",
				destination: `${apiUrl}/:path*`,
			},
		]
	},
}

export default nextConfig
