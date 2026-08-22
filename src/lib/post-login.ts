import { isStaff } from "./staff"

/**
 * Where a sign-in lands.
 *
 * Two things were missing, and they compound. `callbackUrl` is what src/proxy.ts writes
 * when it turns an unauthenticated visitor away from a protected route, and sending them
 * to "/" afterwards makes signing in lose the page they asked for — a moderator who
 * clicked a link to a queue got the marketplace home page instead, twice removed from
 * where they were going. And staff signing in with nothing to return to were dropped on
 * the storefront, although the console is the only reason their account exists.
 */
export function postLoginDestination(
	role: string | undefined,
	callbackUrl: string | null | undefined,
): string {
	return safeInternalPath(callbackUrl) ?? (isStaff(role) ? "/admin" : "/")
}

/** The `callbackUrl` this navigation carries, if any. Read at submit time, so the page
 *  itself stays static — `useSearchParams` would opt it into dynamic rendering. */
export function callbackUrlFromLocation(): string | null {
	if (typeof window === "undefined") return null
	return new URLSearchParams(window.location.search).get("callbackUrl")
}

/**
 * A path this app can navigate to, or null.
 *
 * `callbackUrl` arrives in a query string, so it is attacker-writable: an absolute URL
 * would make the sign-in form an open redirect, and `//host` is protocol-relative — the
 * leading slash is not enough on its own.
 */
function safeInternalPath(value: string | null | undefined): string | null {
	if (!value) return null
	if (!value.startsWith("/") || value.startsWith("//")) return null
	// Landing back on the form that was just submitted is a loop, and proxy.ts would
	// bounce it to "/" anyway now that the session exists.
	if (/^\/(login|register|forgot-password|reset-password)(\/|\?|$)/.test(value)) return null
	return value
}
