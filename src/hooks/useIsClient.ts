import { useSyncExternalStore } from "react"

/** Never fires: the answer differs between server and client but never changes after. */
const subscribe = () => () => {}

/**
 * False during SSR and the first client render, true afterwards.
 *
 * The hydration guard for anything read from a persisted zustand store: localStorage is
 * empty on the server, so rendering the restored value on the first pass would not match
 * the HTML React is hydrating against.
 *
 * `useSyncExternalStore` rather than `useState` + `useEffect` because that is exactly
 * what it is for — a value with one answer on the server and another on the client — and
 * it does not schedule a second render pass through an effect.
 */
export function useIsClient(): boolean {
	return useSyncExternalStore(
		subscribe,
		() => true,
		() => false,
	)
}
