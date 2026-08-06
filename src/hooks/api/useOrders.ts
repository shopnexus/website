"use client"

import { useMemo } from "react"
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
	postDrafts,
	postDraftsByIdCheckout,
	postOrdersByIdConfirmation,
	postOrdersByIdDecline,
	postOrdersByIdReceipt,
	postOrdersByIdCancellation,
	postOrdersByIdRefunds,
	postShippingQuotes,
} from "@/api/generated/sdk.gen"
import {
	getDraftsByIdOptions,
	getOrdersByIdOptions,
	getOrdersInfiniteOptions,
} from "@/api/generated/@tanstack/react-query.gen"
import type {
	CheckoutRequest,
	CreateDraftRequest,
	DraftOrderId,
	OrderId,
	Listing,
	ListingId,
	Order,
	OrderState,
	ShippingQuotesRequest,
} from "@/api/generated/types.gen"
import { useListings } from "./useCatalog"
import { OPERATIONS, invalidate } from "@/api/invalidate"
import { cursorPagination, flattenPages } from "@/api/pagination"
import { unwrapData } from "@/api/unwrap"

export type OrderRole = "buyer" | "seller"

/**
 * Orders, as buyer or as seller. Cursor-paginated: the list index is
 * (owner_id, created_at DESC), so a keyset seek is exact and does not drift when an
 * order arrives at the head mid-page.
 */
export function useOrdersFeed(role: OrderRole, state?: OrderState, limit = 20) {
	const query = useInfiniteQuery({
		...getOrdersInfiniteOptions({ query: { role, state, limit } }),
		...cursorPagination,
	})

	const orders = useMemo(() => flattenPages(query.data), [query.data])

	return { ...query, orders }
}

export function useOrder(id: string | undefined) {
	return useQuery({
		...getOrdersByIdOptions({ path: { id: id! } }),
		select: unwrapData,
		enabled: Boolean(id),
	})
}

/** `/listings?ids=` is capped at the API's maximum page size. */
const MAX_RESOLVED_LISTINGS = 100

/**
 * The listings behind a set of orders, keyed by id.
 *
 * An order line carries `listing_id` and no product name — deliberately, per the spec:
 * order history resolves listings through `GET /listings?ids=`, which still answers for a
 * listing the seller has since hidden or deleted, where an embedded snapshot would have
 * frozen a name and image that no longer match what the buyer can open.
 *
 * One request for a whole page of orders, cached under the id set, so paging in more
 * orders re-resolves only what changed.
 */
export function useOrderListings(orders: ReadonlyArray<Order>) {
	const listingIds = useMemo(() => {
		const ids = new Set<ListingId>()
		for (const order of orders) {
			for (const item of order.items ?? []) ids.add(item.listing_id)
		}
		return [...ids].slice(0, MAX_RESOLVED_LISTINGS)
	}, [orders])

	const { data } = useListings({ ids: listingIds, limit: MAX_RESOLVED_LISTINGS }, 1)

	return useMemo(() => {
		const map = new Map<ListingId, Listing>()
		for (const listing of data ?? []) map.set(listing.id, listing)
		return map
	}, [data])
}

// ── Checkout ─────────────────────────────────────────────────────────────────

/**
 * A purchase session. Freezes the listing's terms, and expires — so it is not cached
 * beyond the checkout page that opened it.
 */
export function useDraft(id: string | undefined) {
	return useQuery({
		...getDraftsByIdOptions({ path: { id: id! } }),
		select: unwrapData,
		enabled: Boolean(id),
		staleTime: 0,
	})
}

export function useCreateDraft() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (body: CreateDraftRequest) => {
			const { data } = await postDrafts({ body, throwOnError: true })
			return data.data
		},
		onSuccess: () => invalidate(queryClient, OPERATIONS.drafts),
	})
}

/**
 * Delivery prices for a parcel.
 *
 * A POST that reads rather than writes — it takes a body because the quote depends on the
 * address, the variant's package details and the quantity together — so it is modelled as
 * a query, not a mutation: the fees are derived state that has to re-resolve whenever the
 * buyer changes the address or the count, which is exactly what a query key does.
 *
 * `enabled` is the caller's, because a quote needs one of variant_id / draft_id /
 * offer_id and the server refuses a request naming none or several.
 */
export function useShippingQuotes(body: ShippingQuotesRequest, enabled = true) {
	return useQuery({
		// Hand-written rather than spread from a generated `*Options()`: hey-api only
		// generates query options for GET operations, and this read is a POST. The key
		// keeps the generated shape — one object with an `_id` — so the invalidation
		// helper in api/invalidate.ts can address it the same way.
		queryKey: [{ _id: "postShippingQuotes", body }],
		queryFn: async ({ signal }) => {
			const { data } = await postShippingQuotes({ body, signal, throwOnError: true })
			return data
		},
		select: unwrapData,
		enabled,
		// Re-quoted at checkout anyway: the spec calls these an estimate a client renders,
		// not a price it can hold, so holding a stale one has no value.
		staleTime: 0,
	})
}

/**
 * Turn a draft into orders.
 *
 * Invalidates almost everything on purpose: checkout consumes the draft, creates orders,
 * empties the matching cart rows and moves stock, so the cached view of each of those is
 * wrong the moment it returns.
 */
/**
 * The seller accepting a paid sale. Nothing reaches the carrier before this, so it is the one
 * action that moves an order out of `awaiting-confirmation` — and it is not re-runnable, because
 * a second confirmation would book a second parcel for one sale.
 */
export function useConfirmOrder() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (orderId: OrderId) => {
			const { data } = await postOrdersByIdConfirmation({
				path: { id: orderId },
				throwOnError: true,
			})
			return data.data
		},
		onSuccess: () => invalidate(queryClient, OPERATIONS.orders, OPERATIONS.order),
	})
}

/**
 * The seller refusing one. The buyer is refunded in full, delivery included, because the parcel
 * never left — so the reason is required, and it is kept on the order rather than dropped.
 * Listings are invalidated with it: the refusal hands the reserved stock back.
 */
export function useDeclineOrder() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async ({ orderId, reason }: { orderId: OrderId; reason: string }) => {
			const { data } = await postOrdersByIdDecline({
				path: { id: orderId },
				body: { reason },
				throwOnError: true,
			})
			return data.data
		},
		onSuccess: () =>
			invalidate(queryClient, OPERATIONS.orders, OPERATIONS.order, OPERATIONS.listings),
	})
}

export function useCheckout() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async ({ draftId, body }: { draftId: DraftOrderId; body: CheckoutRequest }) => {
			const { data } = await postDraftsByIdCheckout({
				path: { id: draftId },
				body,
				throwOnError: true,
			})
			return data.data
		},
		onSuccess: () =>
			invalidate(
				queryClient,
				OPERATIONS.drafts,
				OPERATIONS.draft,
				OPERATIONS.orders,
				OPERATIONS.cartItems,
				OPERATIONS.listings,
			),
	})
}

/*
 * There is no hook for POST /orders/{id}/transport/checkpoints. The carrier reports where
 * a parcel is, on its own webhook, and only staff may correct it — the route answers 403
 * to both the seller and the buyer. Whether the parcel has left is what decides whether
 * the order can still be cancelled and the escrow taken back, so it was never a claim a
 * party to the sale could make: a seller who sees it wrong raises an `order-issue` ticket.
 */

/**
 * Confirms receipt of the order (buyer only).
 */
export function useConfirmReceipt() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async ({ orderId, attachments }: { orderId: OrderId; attachments: string[] }) => {
			const { data } = await postOrdersByIdReceipt({
				path: { id: orderId },
				body: { attachments },
				throwOnError: true,
			})
			return data.data
		},
		onSuccess: () => invalidate(queryClient, OPERATIONS.orders, OPERATIONS.order),
	})
}

/**
 * Cancels an order.
 */
export function useCancelOrder() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (orderId: OrderId) => {
			const { data } = await postOrdersByIdCancellation({
				path: { id: orderId },
				throwOnError: true,
			})
			return data.data
		},
		onSuccess: () => invalidate(queryClient, OPERATIONS.orders, OPERATIONS.order, OPERATIONS.listings),
	})
}

/**
 * Creates a refund request (buyer only).
 */
export function useCreateRefund() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async ({ orderId, reason, attachments }: { orderId: OrderId; reason: string; attachments?: string[] }) => {
			const { data } = await postOrdersByIdRefunds({
				path: { id: orderId },
				body: { reason, attachments },
				throwOnError: true,
			})
			return data.data
		},
		onSuccess: () => invalidate(queryClient, OPERATIONS.orders, OPERATIONS.order),
	})
}

