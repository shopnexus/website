import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query"
import { toast } from "react-hot-toast"
import { ApiError } from "./api-error"
import { getErrorMessage } from "@/lib/error-mapping"

/**
 * Per-query and per-mutation escape hatch, set through TanStack's `meta`.
 *
 * `silent` opts out of the global toast, for the calls whose failure the UI already
 * shows in place — a form that marks its own fields, a badge poll that nobody asked for.
 */
declare module "@tanstack/react-query" {
	interface Register {
		defaultError: ApiError
		queryMeta: { silent?: boolean }
		mutationMeta: { silent?: boolean }
	}
}

/** Codes that must never raise a toast, whatever the caller asked for. */
function isSilentByNature(error: ApiError): boolean {
	// A cancelled request is not a failure the user caused or can act on.
	if (error.code === "aborted") return true
	// The fetch layer has already redirected to /login; a toast on the way out would
	// flash and then be torn down by the navigation.
	if (error.isAuthFailure) return true
	return false
}

/**
 * One error, as one toast. A validation failure becomes a bulleted list rather than a
 * single sentence, which is the whole reason the server sends `fields` — a twelve-input
 * form with three problems is unactionable otherwise.
 */
function toastError(error: ApiError): void {
	if (error.fields.length > 0) {
		toast.error(error.fields.map((f) => `• ${f.message}`).join("\n"), {
			duration: 5000,
			style: { whiteSpace: "pre-line" },
		})
		return
	}
	toast.error(getErrorMessage(error.code))
}

function shouldToast(error: unknown, meta: { silent?: boolean } | undefined): boolean {
	if (typeof window === "undefined") return false
	if (!(error instanceof ApiError)) return false
	if (meta?.silent) return false
	return !isSilentByNature(error)
}

/**
 * The browser's one QueryClient, published so code outside React can reach it.
 *
 * Only the zustand stores need this: they run as plain functions, not hooks, so
 * `useQueryClient()` is unavailable to them — and a sign-in or sign-out has to drop a
 * cache that belongs to the previous identity. Deliberately browser-only: on the server
 * a client is created per request, and a module-level one would be shared between users.
 */
let browserQueryClient: QueryClient | undefined

export function setBrowserQueryClient(client: QueryClient): void {
	if (typeof window === "undefined") return
	browserQueryClient = client
}

export function getBrowserQueryClient(): QueryClient | undefined {
	return browserQueryClient
}

/**
 * A QueryClient. Called once per browser session, and once per request on the server so
 * two users never share a cache.
 */
export function makeQueryClient(): QueryClient {
	return new QueryClient({
		defaultOptions: {
			queries: {
				// Long enough that moving between pages reuses what was just fetched,
				// short enough that a price or a stock count is not stale on arrival.
				staleTime: 30_000,
				gcTime: 5 * 60_000,
				// The window regaining focus is not evidence the data moved, and on a
				// marketplace it fires constantly as people tab between listings.
				refetchOnWindowFocus: false,
				retry: (failureCount, error) => {
					// A 4xx is the server's considered answer: asking again produces the
					// same one. Only a transport failure or a 5xx is worth repeating.
					if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
						return false
					}
					return failureCount < 2
				},
			},
			mutations: {
				// A write is not idempotent unless the endpoint says so, and none here
				// take an idempotency key from the client.
				retry: false,
			},
		},
		// Cache-level handlers fire once per query, after retries are exhausted, which is
		// what keeps a flaky connection from stacking three identical toasts.
		queryCache: new QueryCache({
			onError: (error, query) => {
				if (shouldToast(error, query.meta)) toastError(error as ApiError)
			},
		}),
		mutationCache: new MutationCache({
			onError: (error, _vars, _ctx, mutation) => {
				if (shouldToast(error, mutation.meta)) toastError(error as ApiError)
			},
		}),
	})
}
