"use client"

import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"

import { invalidate } from "@/api/invalidate"
import { useAuthStore } from "@/stores/use-auth-store"

import { createRealtimeClient } from "./client"
import { REALTIME_FED_OPERATIONS, applyRealtimeEvent } from "./handlers"

/**
 * Holds the one WebSocket for the app.
 *
 * Renders nothing. It lives inside QueryProvider because it needs that client, and it
 * connects only while signed in: the socket's credential is a ticket minted from an
 * access token, so there is nothing to connect with otherwise.
 */
export default function RealtimeProvider({ children }: { children: React.ReactNode }): React.ReactElement {
	const queryClient = useQueryClient()
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

	useEffect(() => {
		if (!isAuthenticated) return

		const client = createRealtimeClient({
			onEvent: (event) => applyRealtimeEvent(queryClient, event),
			// Every connect, not just the first. A disconnect is when events go missing —
			// nothing replays them — so reconnecting means re-reading what the socket feeds.
			// This is what makes removing the polls safe rather than merely cheaper.
			onOpen: () => void invalidate(queryClient, ...REALTIME_FED_OPERATIONS),
		})
		client.connect()

		// Runs on sign-out (isAuthenticated flips) as well as unmount, so a logout stops
		// reconnect attempts instead of leaving a socket retrying for an account that left.
		return () => client.close()
	}, [isAuthenticated, queryClient])

	return <>{children}</>
}
