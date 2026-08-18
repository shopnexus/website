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

	// `enabled: false` không xoá `data` của react-query — nó giữ nguyên kết quả lần fetch gần
	// nhất trong cache. Gộp nhóm ngay trên `shouldFetchPending` thay vì trên `pendingItems` một
	// mình: mở tab "Tất cả" một lần là cache có dữ liệu, và nếu chỉ lọc theo mảng thì thẻ vẫn
	// hiện ở mọi tab sau đó dù `enabled` đã tắt.
	const pendingCheckouts = useMemo(
		() => (shouldFetchPending ? groupCheckouts(pendingItems) : []),
		[shouldFetchPending, pendingItems],
	)

	// Cùng lý do khối chờ thanh toán phải tự đọc lấy: một lượt đặt hàng bị hủy trước khi trả
	// tiền không bao giờ thành `Order`, nên `state=cancelled` của `/orders` không bao giờ
	// nhắc tới nó. Người mua hủy xong mở "Đã hủy" ra thì phải thấy nó ở đấy.
	const shouldFetchCancelled = role === "buyer" && (activeTab === "all" || activeTab === "cancelled")
	const { data: cancelledItems = [], isLoading: isLoadingCancelled } =
		useCancelledItems(shouldFetchCancelled)

	// Cùng lý do ở trên: chốt theo `shouldFetchCancelled`, không chỉ theo mảng, để dữ liệu
	// cache của tab "Đã hủy" không rò sang "Chờ thanh toán", "Chờ xác nhận", "Đang xử lý" hay
	// "Hoàn tiền" sau khi người dùng đã ghé tab "Tất cả" hoặc "Đã hủy" một lần.
	const cancelledCheckouts = useMemo(
		() => (shouldFetchCancelled ? groupCheckouts(cancelledItems) : []),
		[shouldFetchCancelled, cancelledItems],
	)

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
