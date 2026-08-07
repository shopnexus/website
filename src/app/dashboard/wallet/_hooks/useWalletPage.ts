"use client"

import { useMemo, useState } from "react"
import { useWallets } from "@/hooks/api/useFinance"
import { DEFAULT_CURRENCY, walletOrZero } from "@/hooks/api/useWallet"
import type { CurrencyCode, WalletTransactionKind } from "@/api/generated/types.gen"
import type { WalletTab } from "../types"

/**
 * Which balance the page is looking at, and which section of it.
 *
 * A seller usually holds one currency, so the selector is only worth drawing when there
 * is more than one — but the currency still has to be a piece of state, because the
 * ledger and the withdrawal form are both keyed on it.
 *
 * The selected currency falls back to the platform's own when the account holds no wallet
 * at all, which is the ordinary state of somebody who has not sold yet: their balance is
 * zero, not unknown.
 */
export function useWalletPage() {
	const [tab, setTab] = useState<WalletTab>("balance")
	const [kind, setKind] = useState<WalletTransactionKind | undefined>(undefined)
	const [chosen, setChosen] = useState<CurrencyCode | null>(null)

	const { data: wallets, isLoading } = useWallets()

	const currencies = useMemo(
		() => (wallets ?? []).map((w) => w.currency),
		[wallets],
	)

	const currency = chosen ?? currencies[0] ?? DEFAULT_CURRENCY
	const wallet = walletOrZero(wallets, currency)

	return {
		tab,
		setTab,
		kind,
		setKind,
		currency,
		setCurrency: setChosen,
		currencies,
		wallet,
		isLoading,
	}
}
