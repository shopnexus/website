/**
 * A presigned upload URL that points back at this deployment is rewritten to a relative
 * path, so the PUT rides the Next rewrite in next.config.ts instead of crossing origins
 * and needing CORS on the storage endpoint. An absolute URL to a real CDN is left alone.
 */
export function sameOriginUploadUrl(url: string): string {
	if (typeof window === "undefined") return url
	const parsed = new URL(url, window.location.origin)
	return parsed.pathname.startsWith("/api/v1") ? parsed.pathname + parsed.search : url
}
