"use client"

import { useCallback, useSyncExternalStore } from "react"

/**
 * A media query as a value.
 *
 * `useSyncExternalStore` rather than an effect that sets state: the browser is the source
 * of truth here, so reading it during render and subscribing to changes is what it is for.
 * An effect would also mean a second render on every mount, which the React compiler now
 * flags — and it would never notice a query that changed, which happens for real when a
 * keyboard is attached to a tablet.
 *
 * The server snapshot is `false`, so SSR renders the "no" branch and hydration corrects it
 * without a mismatch warning for queries whose default is the common case.
 */
export function useMediaQuery(query: string): boolean {
	const subscribe = useCallback(
		(onChange: () => void) => {
			const list = window.matchMedia(query)
			list.addEventListener("change", onChange)
			return () => list.removeEventListener("change", onChange)
		},
		[query],
	)

	return useSyncExternalStore(
		subscribe,
		() => window.matchMedia(query).matches,
		() => false,
	)
}

/** A touch screen, where the on-screen Enter is the only newline key there is. */
export function useCoarsePointer(): boolean {
	return useMediaQuery("(pointer: coarse)")
}

/** Whoever asked their system to keep movement to a minimum. */
export function usePrefersReducedMotion(): boolean {
	return useMediaQuery("(prefers-reduced-motion: reduce)")
}
