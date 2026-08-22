"use client"

import { useMemo } from "react"
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
	getCategoriesOptions,
	getListingsByIdOptions,
	getListingsInfiniteOptions,
	getListingsOptions,
	getListingsShelvesOptions,
} from "@/api/generated/@tanstack/react-query.gen"
import {
	postListings,
	postListingsByIdPublication,
	postListingsInteractions,
	postListingsSuggestions,
	postListingsUploads,
	postListingsUploadsByIdConfirmation,
	putFavoritesByListingId,
	deleteFavoritesByListingId,
} from "@/api/generated/sdk.gen"
import type {
	CreateListingRequest,
	CreateUploadRequest,
	GetListingsData,
	ListingId,
	PostListingsInteractionsData,
	PublishListingRequest,
	ResourceId,
	SuggestListingRequest,
} from "@/api/generated/types.gen"
import { OPERATIONS, invalidate } from "@/api/invalidate"
import { flattenPages, pagePagination, totalCountOf } from "@/api/pagination"
import { unwrapData } from "@/api/unwrap"

/** The filters `/listings` accepts, minus the paging the feed hook manages itself. */
export type ListingFilters = Omit<NonNullable<GetListingsData["query"]>, "page">

/**
 * The category tree, or a `near` ranking of it.
 *
 * Public and effectively static, so it is held for half an hour rather than refetched by
 * every page that draws a category chip. `near` takes seeds — free text the server
 * embeds and ranks categories against — and returns a flat ranking rather than the tree.
 */
export function useCategories(near?: string[]) {
	return useQuery({
		...getCategoriesOptions({ query: near?.length ? { near } : undefined }),
		select: unwrapData,
		staleTime: 30 * 60_000,
	})
}

/**
 * One listing. Gated on the id so a detail route can render its shell while the route
 * param resolves, without firing a request for `undefined`.
 */
export function useListing(id: string | undefined) {
	return useQuery({
		...getListingsByIdOptions({ path: { id: id! } }),
		select: unwrapData,
		enabled: Boolean(id),
	})
}

/**
 * One page of listings, for the places that draw a numbered pager.
 *
 * `enabled` is for the `ids` lookups: an empty id set is not "every listing", so a caller
 * with nothing to resolve holds the request rather than paging the whole catalog.
 */
export function useListings(filters: ListingFilters = {}, page = 1, enabled = true) {
	return useQuery({
		...getListingsOptions({ query: { ...filters, page } }),
		select: unwrapData,
		enabled,
	})
}

/**
 * The load-more listing feed.
 *
 * `/listings` is page-paginated — it has to be, because a relevance or semantic search
 * ranks by a score computed per query, and a score is not a stored column to seek into —
 * so this walks `page` and stops at `total_count`, or on a short page when the query was
 * ranked and reported no total.
 */
export function useListingsFeed(filters: ListingFilters = {}, enabled = true) {
	const query = useInfiniteQuery({
		...getListingsInfiniteOptions({ query: filters }),
		...pagePagination,
		enabled,
	})

	const listings = useMemo(() => flattenPages(query.data), [query.data])
	// `understood` and `probes` describe the query, not any one page of it, so every page
	// repeats them and the first is enough. Both read as empty before the first page lands,
	// same as an unset query — there is nothing yet to explain either way.
	const firstPage = query.data?.pages[0]

	return {
		...query,
		listings,
		totalCount: totalCountOf(query.data),
		understood: firstPage?.understood ?? "",
		probes: firstPage?.probes ?? [],
	}
}

/**
 * The home page: several short rows, each carrying the reason it is there.
 *
 * One request rather than one per row, and the reasons are why it has to be: the personal
 * shelves are built from the account's interest slots, which are not published and cannot be —
 * a client firing six `/listings` calls could only invent its own headings.
 *
 * `limit` is cards *per shelf*. How many shelves come back is the server's answer: a row it
 * could not fill is dropped rather than rendered short.
 */
export function useShelves(limit = 12) {
	return useQuery({
		...getListingsShelvesOptions({ query: { limit } }),
		select: unwrapData,
	})
}

// ── Posting a listing ────────────────────────────────────────────────────────

export function useRequestListingUpload() {
	return useMutation({
		mutationFn: async (body: CreateUploadRequest) => {
			const { data } = await postListingsUploads({ body, throwOnError: true })
			return data.data
		},
	})
}

export function useConfirmListingUpload() {
	return useMutation({
		mutationFn: async (id: ResourceId) => {
			const { data } = await postListingsUploadsByIdConfirmation({
				path: { id },
				throwOnError: true,
			})
			return data.data
		},
	})
}

/**
 * "Photo in, form out."
 *
 * Writes nothing — no listing, no draft, no row for an attempt that was abandoned. What
 * comes back is a *suggestion* the seller corrects, and `POST /listings` is still the only
 * way a listing comes into existence. So this is a mutation for the request it makes, not
 * for anything it changes, and there is nothing to invalidate.
 */
export function useSuggestListing() {
	return useMutation({
		mutationFn: async (body: SuggestListingRequest) => {
			const { data } = await postListingsSuggestions({ body, throwOnError: true })
			return data.data
		},
	})
}

export function useCreateListing() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (body: CreateListingRequest) => {
			const { data } = await postListings({ body, throwOnError: true })
			return data.data
		},
		onSuccess: () => invalidate(queryClient, OPERATIONS.listings),
	})
}

/**
 * Submit for moderation. This is also where the listing gets its location: `pickup_contact_id`
 * names which of the seller's saved addresses a carrier collects from, and omitting it means
 * their default pickup address. It is frozen onto the row here, because it is both where a
 * carrier goes and how buyers find the listing.
 */
export function usePublishListing() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async ({ id, body }: { id: ListingId; body?: PublishListingRequest }) => {
			const { data } = await postListingsByIdPublication({ path: { id }, body, throwOnError: true })
			return data.data
		},
		onSuccess: () =>
			invalidate(queryClient, OPERATIONS.listings, OPERATIONS.listing, OPERATIONS.listingHistory),
	})
}

// ── Favorites ────────────────────────────────────────────────────────────────

export function useAddFavorite() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (id: string) => {
			await putFavoritesByListingId({ path: { listingID: id }, throwOnError: true })
		},
		onSuccess: () =>
			invalidate(queryClient, OPERATIONS.listings, OPERATIONS.listing, OPERATIONS.shelves),
	})
}

export function useRemoveFavorite() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (id: string) => {
			await deleteFavoritesByListingId({ path: { listingID: id }, throwOnError: true })
		},
		onSuccess: () =>
			invalidate(queryClient, OPERATIONS.listings, OPERATIONS.listing, OPERATIONS.shelves),
	})
}

/** The client-observed kinds — everything the route accepts except "purchase", which order
 *  derives server-side and no client ever sends. */
export type InteractionType = PostListingsInteractionsData["body"]["interactions"][number]["type"]

/**
 * Records a shopper action against a listing. Fire-and-forget, matching the route's own
 * contract: nothing on the page waits on this, and a failure is swallowed rather than
 * surfaced — a lost view costs the feed a slightly stale signal, not a broken page.
 */
export function recordInteraction(listingId: ListingId, type: InteractionType): void {
	void postListingsInteractions({
		body: { interactions: [{ listing_id: listingId, type }] },
	}).catch(() => {})
}
