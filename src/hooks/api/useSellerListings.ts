"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
	deleteListingsById,
	deleteListingsByIdPublication,
	deleteVariantsById,
	patchListingsById,
	patchVariantsById,
	postListingsByIdVariants,
} from "@/api/generated/sdk.gen"
import type {
	CreateVariantRequest,
	ListingId,
	UpdateListingRequest,
	UpdateVariantRequest,
	VariantId,
} from "@/api/generated/types.gen"
import { OPERATIONS, invalidate } from "@/api/invalidate"

/**
 * What a seller can do to a listing after posting it.
 *
 * Publishing lives in `useCatalog` because the sell flow already needed it; everything
 * here is the management half — editing, taking down, deleting, and the variants that
 * carry the price and the stock.
 *
 * Every mutation drops both the feed and the single-listing read: the products table and
 * an open editor show the same row, and a price changed in one is wrong in the other.
 */

/**
 * Edit the listing.
 *
 * Answers 200 when the change applied and 202 when it was held for moderation — the same
 * body either way, so the caller reads `pending_edit` on the result to tell a live edit
 * from a queued one rather than inspecting the status code.
 */
export function useUpdateListing() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async ({ id, body }: { id: ListingId; body: UpdateListingRequest }) => {
			const { data } = await patchListingsById({ path: { id }, body, throwOnError: true })
			return data.data
		},
		onSuccess: () => invalidate(queryClient, OPERATIONS.listings, OPERATIONS.listing),
	})
}

/**
 * Take it off sale. The row survives — `hidden` is reversible by publishing again, and
 * the orders that reference it stay renderable.
 */
export function useUnpublishListing() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (id: ListingId) => {
			const { data } = await deleteListingsByIdPublication({ path: { id }, throwOnError: true })
			return data.data
		},
		onSuccess: () => invalidate(queryClient, OPERATIONS.listings, OPERATIONS.listing),
	})
}

/** Remove it for good. Soft on the server, so a past order still renders its item. */
export function useDeleteListing() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (id: ListingId) => {
			await deleteListingsById({ path: { id }, throwOnError: true })
		},
		onSuccess: () => invalidate(queryClient, OPERATIONS.listings, OPERATIONS.listing),
	})
}

// ── Variants ─────────────────────────────────────────────────────────────────

export function useAddVariant() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async ({ id, body }: { id: ListingId; body: CreateVariantRequest }) => {
			const { data } = await postListingsByIdVariants({ path: { id }, body, throwOnError: true })
			return data.data
		},
		onSuccess: () => invalidate(queryClient, OPERATIONS.listings, OPERATIONS.listing),
	})
}

/**
 * Price, stock and which variant the card shows.
 *
 * `quantity` is the new total on hand, not a delta, and the server refuses anything below
 * `reserved + sold` — units already promised to a checkout cannot be un-stocked.
 */
export function useUpdateVariant() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async ({ id, body }: { id: VariantId; body: UpdateVariantRequest }) => {
			const { data } = await patchVariantsById({ path: { id }, body, throwOnError: true })
			return data.data
		},
		onSuccess: () => invalidate(queryClient, OPERATIONS.listings, OPERATIONS.listing),
	})
}

/** Refused on the last variant: a listing with no price is not a listing. */
export function useDeleteVariant() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (id: VariantId) => {
			await deleteVariantsById({ path: { id }, throwOnError: true })
		},
		onSuccess: () => invalidate(queryClient, OPERATIONS.listings, OPERATIONS.listing),
	})
}
