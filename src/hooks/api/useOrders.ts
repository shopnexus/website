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
	postOrdersByOrderIdFeedback,
	postOrdersUploads,
	postOrdersUploadsByIdConfirmation,
	postShippingQuotes,
} from "@/api/generated/sdk.gen"
import {
	getDraftsByIdOptions,
	getItemsOptions,
	getOrdersByIdOptions,
	getOrdersByOrderIdFeedbackOptions,
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
	ResourceId,
	ShippingQuotesRequest,
} from "@/api/generated/types.gen"
import { useListings } from "./useCatalog"
import { OPERATIONS, invalidate } from "@/api/invalidate"
import { cursorPagination, flattenPages } from "@/api/pagination"
import { sameOriginUploadUrl } from "@/api/upload"
import { unwrapData } from "@/api/unwrap"

export type OrderRole = "buyer" | "seller"

/**
 * Orders. Cursor-paginated: the list index is (owner_id, created_at DESC), so a keyset
 * seek is exact and does not drift when an order arrives at the head mid-page.
 *
 * `role` is optional and omitting it is the normal case — the route then answers every
 * order the caller is a party to, either side. A screen that asks "what needs me" spans
 * both, and asking twice would need two cursors merged by hand.
 */
export function useOrdersFeed(role?: OrderRole, state?: OrderState, limit = 20) {
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
export function useListingMap(listingIds: ReadonlyArray<ListingId>) {
	const capped = useMemo(
		() => [...new Set(listingIds)].slice(0, MAX_RESOLVED_LISTINGS),
		[listingIds],
	)

	const { data } = useListings({ ids: capped, limit: MAX_RESOLVED_LISTINGS }, 1)

	return useMemo(() => {
		const map = new Map<ListingId, Listing>()
		for (const listing of data ?? []) map.set(listing.id, listing)
		return map
	}, [data])
}

export function useOrderListings(orders: ReadonlyArray<Order>) {
	const listingIds = useMemo(() => {
		const ids = new Set<ListingId>()
		for (const order of orders) {
			for (const item of order.items ?? []) ids.add(item.listing_id)
		}
		return [...ids]
	}, [orders])

	return useListingMap(listingIds)
}

/**
 * Checkout lines the money has not produced an order for yet.
 *
 * These are the purchases missing from the order screen entirely. An order is written by
 * the payment webhook — `order_id` is null until then — so a buyer who opened a checkout
 * and did not finish paying has nothing in `GET /orders` at all, and the money is still
 * theirs to send. `pending=true` is the contract's own filter for exactly this: lines no
 * order covers and nobody cancelled.
 *
 * Not paginated. A buyer has a handful of unfinished checkouts at most, and a cursor here
 * would be machinery for a list that is nearly always empty.
 */
export function usePendingItems(limit = 50) {
	return useQuery({
		...getItemsOptions({ query: { role: "buyer", pending: true, limit } }),
		select: (res) => res.data,
	})
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
 * A photo of the unboxing, or of what a refund is being asked for.
 *
 * Three steps and the middle one leaves this API: a signed slot, a PUT straight to
 * storage, then a confirmation that makes the row real. The order routes have their own
 * pair — the resource has to belong to the module that will read it back, so an avatar's
 * upload route cannot stand in.
 *
 * `postOrdersByIdReceipt` refuses an empty list, so a failure here has to fail the whole
 * confirmation rather than send one with nothing attached.
 */
export function useUploadOrderEvidence() {
	return useMutation({
		mutationFn: async (file: File): Promise<ResourceId> => {
			const { data: reserved } = await postOrdersUploads({
				body: { filename: file.name, mime: file.type, size: file.size },
				throwOnError: true,
			})
			const slot = reserved.data

			const put = await fetch(sameOriginUploadUrl(slot.url), {
				method: "PUT",
				body: file,
				headers: { "Content-Type": file.type, ...slot.headers },
			})
			if (!put.ok) throw new Error("Tải ảnh lên thất bại.")

			const { data: confirmed } = await postOrdersUploadsByIdConfirmation({
				path: { id: slot.resource_id },
				throwOnError: true,
			})
			return confirmed.data.id
		},
	})
}

/**
 * Confirms receipt of the order (buyer only).
 */
export function useConfirmReceipt() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async ({
			orderId,
			attachments,
		}: {
			orderId: OrderId
			attachments: ResourceId[]
		}) => {
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
		mutationFn: async ({ orderId, reason, attachments }: { orderId: OrderId; reason: string; attachments?: ResourceId[] }) => {
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

/**
 * Both directions of one order's feedback, as far as the caller may see them.
 *
 * `theirs` stays null while the rating is blind and `theirs_submitted` says whether
 * anything is waiting — which is what lets the rating dialog say "họ đã đánh giá" without
 * showing what they wrote.
 */
export function useOrderFeedback(orderId: OrderId | undefined) {
	return useQuery({
		...getOrdersByOrderIdFeedbackOptions({ path: { orderID: orderId! } }),
		select: unwrapData,
		enabled: Boolean(orderId),
	})
}

/**
 * Rate the counterparty. One submission per direction, so it cannot be revised: a rating
 * editable after seeing the other side is not blind. The direction is derived from which
 * side of the order the caller is on and is never sent.
 */
export function useSubmitFeedback() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async ({
			orderId,
			rating,
			comment,
		}: {
			orderId: OrderId
			rating: number
			comment?: string
		}) => {
			const { data } = await postOrdersByOrderIdFeedback({
				path: { orderID: orderId },
				body: { rating, comment },
				throwOnError: true,
			})
			return data.data
		},
		onSuccess: () => invalidate(queryClient, OPERATIONS.orderFeedback),
	})
}

