"use client"

import { useMemo, useState } from "react"
import { useMe } from "@/hooks/api/useAccount"
import { useListingMap, useOrdersFeed, usePendingItems } from "@/hooks/api/useOrders"
import { groupPendingCheckouts } from "@/lib/pending-checkout"
import type { ListingId, Order, OrderState } from "@/api/generated/types.gen"

export type OrderTab = "all" | "pending-payment" | "awaiting-confirmation" | "open" | "completed" | "cancelled"

export function useOrderInbox(role: "buyer" | "seller", activeTab: OrderTab) {
	const { data: me } = useMe()

	const state: OrderState | undefined =
		activeTab === "awaiting-confirmation" ||
		activeTab === "open" ||
		activeTab === "completed" ||
		activeTab === "cancelled"
			? activeTab
			: undefined

	const { orders, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useOrdersFeed(role, state)

	const shouldFetchPending = role === "buyer" && (activeTab === "all" || activeTab === "pending-payment")
	const { data: pendingItems = [], isLoading: isLoadingPending } = usePendingItems(shouldFetchPending)

	const pendingCheckouts = useMemo(() => groupPendingCheckouts(pendingItems), [pendingItems])

	const listingIds = useMemo(() => {
		const ids = new Set<ListingId>()
		for (const order of orders) for (const item of order.items ?? []) ids.add(item.listing_id)
		for (const item of pendingItems) ids.add(item.listing_id)
		return [...ids]
	}, [orders, pendingItems])
	
	const listingsById = useListingMap(listingIds)

	return {
		me: me?.id,
		orders,
		pendingCheckouts,
		listingsById,
		isLoading: isLoading || isLoadingPending,
		isEmpty: orders.length === 0 && pendingCheckouts.length === 0,
		hasNextPage,
		isFetchingNextPage,
		fetchNextPage,
	}
}
