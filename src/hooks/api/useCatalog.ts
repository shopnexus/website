"use client"

import { useMemo } from "react"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import {
	getCategoriesOptions,
	getListingsByIdOptions,
	getListingsInfiniteOptions,
	getListingsOptions,
} from "@/api/generated/@tanstack/react-query.gen"
import type { GetListingsData } from "@/api/generated/types.gen"
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

/** One page of listings, for the places that draw a numbered pager. */
export function useListings(filters: ListingFilters = {}, page = 1) {
	return useQuery({
		...getListingsOptions({ query: { ...filters, page } }),
		select: unwrapData,
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
export function useListingsFeed(filters: ListingFilters = {}) {
	const query = useInfiniteQuery({
		...getListingsInfiniteOptions({ query: filters }),
		...pagePagination,
	})

	const listings = useMemo(() => flattenPages(query.data), [query.data])

	return {
		...query,
		listings,
		totalCount: totalCountOf(query.data),
	}
}
