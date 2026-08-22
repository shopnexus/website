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
	const wanted = safeInternalPath(callbackUrl)
	if (!isStaff(role)) return wanted ?? "/"

	// Staff go to the console, and a `callbackUrl` does not change that. It used to win
	// outright, which meant signing in almost always landed a moderator on a storefront page:
	// `callbackUrl` is written by proxy.ts whenever it turns anyone away from any protected
	// route, so a stale /cart or /account link in a bookmark was enough to put them on the
	// wrong side of the product. A callback *into* the console is still honoured — somebody
	// who clicked a link to one case should land on that case, not on the overview.
	return wanted && isConsolePath(wanted) ? wanted : "/admin"
}

/** Inside the staff console. Exact, so a future `/adminfoo` route cannot pass for one. */
function isConsolePath(path: string): boolean {
	return path === "/admin" || path.startsWith("/admin/") || path.startsWith("/admin?")
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
