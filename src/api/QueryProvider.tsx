"use client"

import { useState } from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { makeQueryClient, setBrowserQueryClient } from "./query-client"

export default function QueryProvider({ children }: { children: React.ReactNode }) {
	// useState, not a module-level singleton: on the server this component renders once
	// per request, and a shared client would leak one user's cache into another's page.
	// The initialiser form also survives React's double-invoke in strict mode without
	// building a second client.
	const [queryClient] = useState(() => {
		const client = makeQueryClient()
		// Published for the zustand stores, which sign in and out from outside React.
		setBrowserQueryClient(client)
		return client
	})

	return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
