// Token storage. Cookies rather than localStorage because src/proxy.ts reads
// access_token on the edge to gate protected routes, and middleware cannot see
// localStorage.

const ACCESS = "access_token"
const REFRESH = "refresh_token"

/** Thirty days, matching the refresh token's own lifetime on the server. */
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30

function readBrowserCookie(name: string): string | undefined {
	const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))
	return match ? match[2] : undefined
}

async function readServerCookie(name: string): Promise<string | undefined> {
	// Imported lazily so this module stays importable from client components.
	const { cookies } = await import("next/headers")
	const store = await cookies()
	return store.get(name)?.value
}

export async function getAccessToken(): Promise<string | undefined> {
	return typeof window === "undefined"
		? readServerCookie(ACCESS)
		: readBrowserCookie(ACCESS)
}

export async function getRefreshToken(): Promise<string | undefined> {
	return typeof window === "undefined"
		? readServerCookie(REFRESH)
		: readBrowserCookie(REFRESH)
}

/**
 * Persist a fresh token pair. No-op on the server: a Server Component render
 * cannot write cookies, so a refresh that happens during SSR is good for that
 * one request only and the browser re-refreshes on its next call.
 */
export function setTokens(accessToken: string, refreshToken: string, expiresIn: number): void {
	if (typeof window === "undefined") return
	document.cookie = `${ACCESS}=${accessToken}; path=/; max-age=${expiresIn}; SameSite=Lax`
	document.cookie = `${REFRESH}=${refreshToken}; path=/; max-age=${REFRESH_MAX_AGE}; SameSite=Lax`
}

export function clearTokens(): void {
	if (typeof window === "undefined") return
	document.cookie = `${ACCESS}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
	document.cookie = `${REFRESH}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
}
