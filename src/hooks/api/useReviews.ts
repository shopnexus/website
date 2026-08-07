"use client"

import { useMemo } from "react"
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
	getListingsByListingIdReviewsInfiniteOptions,
	getReviewsByIdOptions,
} from "@/api/generated/@tanstack/react-query.gen"
import {
	deleteReviewsById,
	deleteReviewsByIdVote,
	postListingsByListingIdReviews,
	postReviewsByIdReplies,
	postReviewsUploads,
	postReviewsUploadsByIdConfirmation,
	putReviewsByIdVote,
} from "@/api/generated/sdk.gen"
import type {
	GetListingsByListingIdReviewsData,
	ListingId,
	ResourceId,
	Review,
	ReviewId,
	SubmitReviewRequest,
} from "@/api/generated/types.gen"
import { OPERATIONS, invalidate } from "@/api/invalidate"
import { cursorPagination, flattenPages } from "@/api/pagination"
import { sameOriginUploadUrl } from "@/api/upload"
import { unwrapData } from "@/api/unwrap"
import type { VoteValue } from "@/lib/reviews"

/** What `/listings/{id}/reviews` filters and orders by, minus the cursor the feed walks. */
export type ReviewFilters = Omit<
	NonNullable<GetListingsByListingIdReviewsData["query"]>,
	"cursor" | "limit"
>

export type ReviewSort = NonNullable<ReviewFilters["sort"]>

/**
 * Reviews of one listing.
 *
 * Cursor-paginated, and a cursor belongs to the sort it was issued under — so the filter
 * and the sort are part of the query key and switching either starts the traversal again
 * rather than seeking with a cursor the new ordering cannot read.
 */
export function useListingReviews(
	listingId: ListingId | undefined,
	filters: ReviewFilters = {},
	limit = 10,
) {
	const query = useInfiniteQuery({
		...getListingsByListingIdReviewsInfiniteOptions({
			path: { listingID: listingId! },
			query: { ...filters, limit },
		}),
		...cursorPagination,
		enabled: Boolean(listingId),
	})

	const reviews = useMemo(() => flattenPages(query.data), [query.data])

	return { ...query, reviews }
}

/** One review with its whole reply thread — the listing page caps the thread at a few. */
export function useReview(id: ReviewId | undefined) {
	return useQuery({
		...getReviewsByIdOptions({ path: { id: id! } }),
		select: unwrapData,
		enabled: Boolean(id),
	})
}

/**
 * Cast, replace or withdraw a vote.
 *
 * `null` is a DELETE rather than a stored zero: the API keeps no neutral row, because a
 * stored zero is a row that says nothing.
 */
export function useVoteReview() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async ({ id, vote }: { id: ReviewId; vote: VoteValue | null }) => {
			if (vote === null) {
				const { data } = await deleteReviewsByIdVote({ path: { id }, throwOnError: true })
				return data.data
			}
			const { data } = await putReviewsByIdVote({
				path: { id },
				body: { vote },
				throwOnError: true,
			})
			return data.data
		},
		onSuccess: () => invalidate(queryClient, OPERATIONS.listingReviews, OPERATIONS.review),
	})
}

/** Anyone signed in may add to the thread; the seller answering is the usual case. */
export function useReplyToReview() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async ({ id, body }: { id: ReviewId; body: string }) => {
			const { data } = await postReviewsByIdReplies({
				path: { id },
				body: { body },
				throwOnError: true,
			})
			return data.data
		},
		onSuccess: () => invalidate(queryClient, OPERATIONS.listingReviews, OPERATIONS.review),
	})
}

/** The author's own, or a moderator's. */
export function useDeleteReview() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (id: ReviewId) => {
			await deleteReviewsById({ path: { id }, throwOnError: true })
		},
		onSuccess: () =>
			invalidate(
				queryClient,
				OPERATIONS.listingReviews,
				OPERATIONS.review,
				OPERATIONS.listing,
				OPERATIONS.reputation,
			),
	})
}

/**
 * A review photo, in the three steps every upload here takes: a signed slot, a PUT
 * straight to storage, then the confirmation that makes the row real. Trust has its own
 * pair — a resource belongs to the module that reads it back, so the listing upload route
 * cannot stand in for this one.
 */
export function useUploadReviewPhoto() {
	return useMutation({
		mutationFn: async (file: File): Promise<ResourceId> => {
			const { data: reserved } = await postReviewsUploads({
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

			const { data: confirmed } = await postReviewsUploadsByIdConfirmation({
				path: { id: slot.resource_id },
				throwOnError: true,
			})
			return confirmed.data.id
		},
	})
}

/**
 * Post a review of a listing you bought.
 *
 * `order_id` is what makes it a review rather than an opinion: the server refuses one for
 * an order that is not the caller's, did not include this listing, did not complete, or
 * has already been reviewed. The listing read is invalidated alongside the list because
 * the average and the count live on the listing row.
 */
export function useSubmitReview() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async ({
			listingId,
			...body
		}: SubmitReviewRequest & { listingId: ListingId }): Promise<Review> => {
			const { data } = await postListingsByListingIdReviews({
				path: { listingID: listingId },
				body,
				throwOnError: true,
			})
			return data.data
		},
		onSuccess: () =>
			invalidate(
				queryClient,
				OPERATIONS.listingReviews,
				OPERATIONS.listing,
				OPERATIONS.listings,
				OPERATIONS.reputation,
			),
	})
}
