"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { AdminAccount } from "@/api/generated/types.gen"
import { useAccountSearch, useAdminWallets } from "@/hooks/api/useAdminFinance"

/** Long enough that typing a name is one request, short enough to feel like none. */
const SEARCH_DELAY_MS = 300

/**
 * The inspector's state: who is being looked at, and how they were found.
 *
 * It opens from a withdrawal row on a *name*, not on an id, because the payout projection
 * carries the bank destination and not the payee. So the account still has to be chosen,
 * and choosing it is what unlocks the balances and the two writes below them.
 *
 * The search term is debounced through a timer owned by the setter rather than by an
 * effect watching the value: the request is a consequence of typing, so it belongs where
 * the typing is handled.
 */
export function useWalletInspector() {
	const [isOpen, setIsOpen] = useState(false)
	const [term, setTermState] = useState("")
	const [searchTerm, setSearchTerm] = useState("")
	const [selected, setSelected] = useState<AdminAccount | null>(null)
	const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

	const search = useAccountSearch(searchTerm)
	const wallets = useAdminWallets(selected?.id)

	const setTerm = useCallback((next: string) => {
		setTermState(next)
		if (timer.current) clearTimeout(timer.current)
		timer.current = setTimeout(() => setSearchTerm(next), SEARCH_DELAY_MS)
	}, [])

	// A pending timer that fires after the panel closes would fetch for a screen nobody
	// is looking at.
	useEffect(() => () => {
		if (timer.current) clearTimeout(timer.current)
	}, [])

	const open = (initialTerm: string) => {
		if (timer.current) clearTimeout(timer.current)
		setTermState(initialTerm)
		setSearchTerm(initialTerm)
		setSelected(null)
		setIsOpen(true)
	}

	const close = useCallback(() => setIsOpen(false), [])

	return {
		isOpen,
		open,
		close,
		term,
		setTerm,
		accounts: search.accounts,
		searching: search.isFetching,
		searched: search.isSuccess,
		selected,
		select: setSelected,
		clearSelection: () => setSelected(null),
		wallets: wallets.wallets,
		walletsLoading: wallets.isLoading,
	}
}
