"use client"

import { useMemo, useState } from "react"
import { useListingsFeed } from "@/hooks/api/useCatalog"
import { useChatUnreadCount } from "@/hooks/api/useChat"
import { useWallets } from "@/hooks/api/useFinance"
import { useOrdersFeed } from "@/hooks/api/useOrders"
import { useOrdersSummary } from "@/hooks/api/useOrdersSummary"
import { useReputation } from "@/hooks/api/useShop"
import { walletOrZero } from "@/hooks/api/useWallet"
import type { AccountId } from "@/api/generated/types.gen"

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

/**
 * Everything the overview screen reads, in one place.
 *
 * The window is frozen on mount rather than recomputed per render, so the summary query
 * keeps one cache key instead of minting a new one every time React re-renders.
 *
 * `awaiting-confirmation` is the state with a clock on it — `open` means the seller
 * already confirmed and the parcel is with a carrier, which is the opposite of needing
 * them — so that is the queue the "needs you" card counts.
 */
export function useDashboardOverview(accountId: AccountId | undefined, isSeller: boolean) {
	const [anchor] = useState(() => Date.now())
	const window = useMemo(
		() => ({
			from: new Date(anchor - THIRTY_DAYS_MS).toISOString(),
			to: new Date(anchor).toISOString(),
		}),
		[anchor],
	)

	const { listings } = useListingsFeed({ mine: true, limit: 3 }, isSeller)
	const { data: wallets, isLoading: walletLoading } = useWallets()
	const { data: reputation } = useReputation(accountId, "seller")
	const { orders: pendingOrders } = useOrdersFeed("seller", "awaiting-confirmation", 5, isSeller)
	const { orders: recentPurchases } = useOrdersFeed("buyer", undefined, 5, !isSeller)
	const { data: chatUnread, isLoading: chatLoading } = useChatUnreadCount()
	const { data: summary, isLoading: summaryLoading } = useOrdersSummary(
		isSeller ? "seller" : "buyer",
		window.from,
		window.to,
	)

	// The seller's own currency, whichever wallet they hold — and an explicit zero where
	// they hold none, which is the ordinary state before the first sale settles.
	const wallet = walletOrZero(wallets, wallets?.[0]?.currency ?? "VND")
	const revenue = summary?.totals.find((total) => total.currency === wallet.currency)

	return {
		listings,
		wallet,
		walletLoading,
		reputation,
		pendingOrders,
		recentPurchases,
		chatUnread: chatUnread?.unread ?? 0,
		chatLoading,
		summary,
		summaryLoading,
		revenue,
	}
}
