import type { CreateClientConfig } from "./generated/client.gen"
import { toApiError } from "./api-error"
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "./tokens"

/**
 * Client configuration, applied to the generated client at import time.
 *
 * Three concerns live here and nowhere else: attaching the bearer token, refreshing it
 * once when it expires, and turning the error envelope into a real Error. Everything
 * downstream — the SDK, the generated query options, the hooks — is then free of auth.
 *
 * All of it hangs off a custom `fetch` rather than the client's interceptors, because an
 * interceptor has to be registered on the client instance after it is constructed, and
 * the generated client constructs itself at import time. Anything that imported the SDK
 * before the registration module happened to run would silently skip auth. A `fetch` in
 * the config has no such ordering hazard: it is part of the client from its first call.
 */

// On the server, requests go straight to the gateway; in the browser they go through the
// Next rewrite in next.config.ts, which keeps them same-origin and lets cookies ride.
const BASE_URL =
	typeof window === "undefined"
		? (process.env.NEXT_PUBLIC_API_URL ?? "/api/v1")
		: "/api/v1"

/** The 401 codes a refresh can actually fix. Anything else is a real rejection. */
const REFRESHABLE = new Set(["unauthorized", "invalid_token"])

/**
 * The in-flight refresh, or null. Every 401 arriving while a refresh runs awaits this
 * same promise instead of starting its own: five parallel queries hitting an expired
 * token must produce one refresh call, not five. The server rotates the refresh token on
 * use, so four of those five would be replaying a token already spent — and would log
 * the user out.
 */
let refreshInFlight: Promise<string | null> | null = null

async function requestNewTokens(): Promise<string | null> {
	const refreshToken = await getRefreshToken()
	if (!refreshToken) return null

	// A bare fetch, not the generated postTokenRefresh: this runs inside the client's
	// own fetch, and re-entering it here would recurse on failure.
	const res = await globalThis.fetch(`${BASE_URL}/token/refresh`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ refresh_token: refreshToken }),
	})
	if (!res.ok) return null

	const body = await res.json().catch(() => null)
	const auth = body?.data
	if (typeof auth?.access_token !== "string") return null

	setTokens(auth.access_token, auth.refresh_token, auth.expires_in)
	return auth.access_token
}

function refreshOnce(): Promise<string | null> {
	refreshInFlight ??= requestNewTokens()
		.catch(() => null)
		.finally(() => {
			refreshInFlight = null
		})
	return refreshInFlight
}

/** Give up on the session and send the user to sign in again. */
function abandonSession(): void {
	clearTokens()
	if (typeof window === "undefined") return
	if (window.location.pathname.startsWith("/login")) return
	const next = encodeURIComponent(window.location.pathname + window.location.search)
	window.location.href = `/login?callbackUrl=${next}`
}

/** Read the code out of an error body without consuming the response the caller holds. */
async function errorCodeOf(response: Response): Promise<string | undefined> {
	const body = await response
		.clone()
		.json()
		.catch(() => null)
	return body?.error?.code
}

async function throwForStatus(response: Response): Promise<never> {
	const body = await response.json().catch(() => null)
	throw toApiError(body, response.status, response.headers.get("X-Request-Id") ?? undefined)
}

const apiFetch: typeof fetch = async (input, init) => {
	const request = input instanceof Request ? input : new Request(input, init)
	// Cloned before the body is consumed, so a retry after refresh can replay it.
	const replay = request.clone()

	let response: Response
	try {
		response = await globalThis.fetch(request)
	} catch (cause) {
		// fetch only rejects when the request never completed: DNS, TLS, offline, or an
		// abort from TanStack cancelling the query.
		throw toApiError(cause, 0)
	}

	if (response.status === 401) {
		const code = await errorCodeOf(response)
		if (code && REFRESHABLE.has(code)) {
			const token = await refreshOnce()
			if (!token) {
				abandonSession()
				return throwForStatus(response)
			}
			const headers = new Headers(replay.headers)
			headers.set("Authorization", `Bearer ${token}`)
			try {
				response = await globalThis.fetch(new Request(replay, { headers }))
			} catch (cause) {
				throw toApiError(cause, 0)
			}
			// Still refused with a token minted seconds ago: the session is gone.
			if (response.status === 401) {
				abandonSession()
			}
		}
	}

	if (!response.ok) return throwForStatus(response)
	return response
}

export const createClientConfig: CreateClientConfig = (config) => ({
	...config,
	baseUrl: BASE_URL,
	fetch: apiFetch,
	// Called only for operations the spec marks with bearerAuth, so the public routes
	// — login, register, categories, listings — never read a cookie.
	auth: () => getAccessToken(),
})
