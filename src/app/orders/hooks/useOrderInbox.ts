"use client"

import { useMemo, useState } from "react"
import { useMe } from "@/hooks/api/useAccount"
import { useListingMap, useOrdersFeed, usePendingItems } from "@/hooks/api/useOrders"
import { groupPendingCheckouts } from "@/lib/pending-checkout"
import { WAITING_SIDES, waitingDeadline, waitingSideOf, type WaitingSide } from "@/lib/order-waiting"
import type { ListingId, Order } from "@/api/generated/types.gen"

/** How many finished orders are shown before "xem thêm". */
const FINISHED_PAGE = 10

/**
 * The order screen's state: one role-less feed, grouped by whose turn it is.
 *
 * No role parameter and no state filter go to the server. The old screen sent both — a
 * buying/selling toggle and five state tabs — to slice a list that is usually a handful
 * of rows, and each switch threw away the cursor and refetched. Grouping in memory over
 * one stream is both fewer requests and the only way "what needs me" can span the two
 * sides at once.
 *
 * `GET /orders` is not the whole screen, though. An order is written by the payment
 * webhook, so a checkout the buyer opened and did not pay produces no order at all — it
 * was invisible here, and the money was still theirs to send. Those live in
 * `GET /items?pending=true` and come in beside the orders.
 */
export function useOrderInbox() {
	const [finishedShown, setFinishedShown] = useState(FINISHED_PAGE)

	const { data: me } = useMe()
	const { orders, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useOrdersFeed()
	const { data: pendingItems = [], isLoading: isLoadingPending } = usePendingItems()

	const pendingCheckouts = useMemo(() => groupPendingCheckouts(pendingItems), [pendingItems])

	// One resolve for both sources: an unpaid checkout and a paid order name their listings
	// the same way, and two calls would be two cache entries for one set of products.
	const listingIds = useMemo(() => {
		const ids = new Set<ListingId>()
		for (const order of orders) for (const item of order.items ?? []) ids.add(item.listing_id)
		for (const item of pendingItems) ids.add(item.listing_id)
		return [...ids]
	}, [orders, pendingItems])
	const listingsById = useListingMap(listingIds)

	const groups = useMemo(() => {
		const grouped: Record<WaitingSide, Order[]> = { you: [], other: [], done: [] }
		for (const order of orders) grouped[waitingSideOf(order, me?.id)].push(order)
		// Soonest deadline first — that ordering is the entire reason the group exists.
		grouped.you.sort((a, b) => waitingDeadline(a) - waitingDeadline(b))
		return grouped
	}, [orders, me?.id])

	// One button, one meaning: "show me more finished orders". Reveal what is already
	// loaded first and only then ask for a page — where that boundary falls is the
	// cursor's business, not the reader's.
	const finished = groups.done.slice(0, finishedShown)
	const hasMoreFinished = groups.done.length > finished.length || hasNextPage

	const showMoreFinished = () => {
		if (groups.done.length > finishedShown) setFinishedShown((shown) => shown + FINISHED_PAGE)
		else fetchNextPage()
	}

	return {
		me: me?.id,
		groups: { ...groups, done: finished },
		order: WAITING_SIDES,
		pendingCheckouts,
		listingsById,
		isLoading: isLoading || isLoadingPending,
		isEmpty: orders.length === 0 && pendingCheckouts.length === 0,
		hasMoreFinished,
		isFetchingNextPage,
		showMoreFinished,
	}
}
