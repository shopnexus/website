"use client"

import { useMemo, useState } from "react"
import { useMe } from "@/hooks/api/useAccount"
import { useCancelledItems, useListingMap, useOrdersFeed, usePendingItems } from "@/hooks/api/useOrders"
import { groupCheckouts } from "@/lib/pending-checkout"
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

	const pendingCheckouts = useMemo(() => groupCheckouts(pendingItems), [pendingItems])

	// Cùng lý do khối chờ thanh toán phải tự đọc lấy: một lượt đặt hàng bị hủy trước khi trả
	// tiền không bao giờ thành `Order`, nên `state=cancelled` của `/orders` không bao giờ
	// nhắc tới nó. Người mua hủy xong mở "Đã hủy" ra thì phải thấy nó ở đấy.
	const shouldFetchCancelled = role === "buyer" && (activeTab === "all" || activeTab === "cancelled")
	const { data: cancelledItems = [], isLoading: isLoadingCancelled } =
		useCancelledItems(shouldFetchCancelled)

	const cancelledCheckouts = useMemo(() => groupCheckouts(cancelledItems), [cancelledItems])

	const listingIds = useMemo(() => {
		const ids = new Set<ListingId>()
		for (const order of orders) for (const item of order.items ?? []) ids.add(item.listing_id)
		for (const item of pendingItems) ids.add(item.listing_id)
		for (const item of cancelledItems) ids.add(item.listing_id)
		return [...ids]
	}, [orders, pendingItems, cancelledItems])
	
	const listingsById = useListingMap(listingIds)

	return {
		me: me?.id,
		orders,
		pendingCheckouts,
		cancelledCheckouts,
		listingsById,
		isLoading: isLoading || isLoadingPending || isLoadingCancelled,
		isEmpty:
			orders.length === 0 && pendingCheckouts.length === 0 && cancelledCheckouts.length === 0,
		hasNextPage,
		isFetchingNextPage,
		fetchNextPage,
	}
}
