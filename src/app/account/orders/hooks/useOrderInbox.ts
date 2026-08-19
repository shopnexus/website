"use client"

import { useMemo, useState } from "react"
import { useMe } from "@/hooks/api/useAccount"
import { useCancelledItems, useListingMap, useOrdersFeed, usePendingItems } from "@/hooks/api/useOrders"
import { groupCheckouts } from "@/lib/pending-checkout"
import type { ListingId, Order, OrderState } from "@/api/generated/types.gen"

/**
 * Một tab của hộp đơn.
 *
 * "Chờ thanh toán" là tab duy nhất không phải một `OrderState`: đơn hàng chỉ được ghi khi
 * webhook thanh toán chạy, nên thứ đang chờ trả tiền vẫn còn là dòng checkout và `/orders`
 * không bao giờ nhắc tới nó. Bốn tab còn lại *chính là* bốn giá trị của `OrderState`, nên
 * kiểu này viết thẳng như vậy thay vì liệt kê lại từng cái.
 */
export type OrderTab = "pending-payment" | OrderState

export function useOrderInbox(role: "buyer" | "seller", activeTab: OrderTab) {
	const { data: me } = useMe()

	// Từ khi bỏ tab "Tất cả", không tab nào còn hỏi `/orders` một danh sách không lọc — bỏ
	// trống `state` nghĩa là "lấy mọi đơn", tức là trộn cả "Hoàn thành" lẫn "Đã hủy" vào tab
	// đang mở. `undefined` giờ chỉ còn đúng một nghĩa: tab này không đọc `/orders` chút nào.
	const state: OrderState | undefined = activeTab === "pending-payment" ? undefined : activeTab
	const shouldFetchOrders = state !== undefined
	const feed = useOrdersFeed(role, state, undefined, shouldFetchOrders)

	// Cùng lý do như hai khối dưới: `enabled: false` giữ nguyên kết quả lần fetch gần nhất
	// trong cache, nên phải chốt theo `shouldFetchOrders` chứ không chỉ dựa vào query.
	const orders = useMemo(() => (shouldFetchOrders ? feed.orders : []), [shouldFetchOrders, feed.orders])
	const hasNextPage = shouldFetchOrders && feed.hasNextPage
	const { isLoading, fetchNextPage, isFetchingNextPage } = feed

	const shouldFetchPending = role === "buyer" && activeTab === "pending-payment"
	const { data: pendingItems = [], isLoading: isLoadingPending } = usePendingItems(shouldFetchPending)

	// `enabled: false` không xoá `data` của react-query — nó giữ nguyên kết quả lần fetch gần
	// nhất trong cache. Gộp nhóm ngay trên `shouldFetchPending` thay vì trên `pendingItems` một
	// mình: ghé tab "Chờ thanh toán" một lần là cache có dữ liệu, và nếu chỉ lọc theo mảng thì
	// thẻ vẫn hiện ở mọi tab sau đó dù `enabled` đã tắt.
	const pendingCheckouts = useMemo(
		() => (shouldFetchPending ? groupCheckouts(pendingItems) : []),
		[shouldFetchPending, pendingItems],
	)

	// Cùng lý do khối chờ thanh toán phải tự đọc lấy: một lượt đặt hàng bị hủy trước khi trả
	// tiền không bao giờ thành `Order`, nên `state=cancelled` của `/orders` không bao giờ
	// nhắc tới nó. Người mua hủy xong mở "Đã hủy" ra thì phải thấy nó ở đấy.
	const shouldFetchCancelled = role === "buyer" && activeTab === "cancelled"
	const { data: cancelledItems = [], isLoading: isLoadingCancelled } =
		useCancelledItems(shouldFetchCancelled)

	// Cùng lý do ở trên: chốt theo `shouldFetchCancelled`, không chỉ theo mảng, để dữ liệu
	// cache của tab "Đã hủy" không rò sang "Chờ thanh toán", "Chờ xác nhận", "Đang xử lý" hay
	// "Hoàn thành" sau khi người dùng đã ghé tab "Đã hủy" một lần.
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
