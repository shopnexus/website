"use client"

import { useMemo } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { getListingsByIdHistoryInfiniteOptions } from "@/api/generated/@tanstack/react-query.gen"
import type { ListingId } from "@/api/generated/types.gen"
import { flattenPages, pagePagination, totalCountOf } from "@/api/pagination"

/**
 * A listing's own trail: it being posted, every edit, and every decision staff made about it.
 *
 * One hook for both readers. The route is the same for the seller who owns the listing and
 * for staff, and the server is what decides how much of each entry comes back — so a
 * component rendering this never has to know which of them is looking.
 *
 * Page-paginated, and the page is deliberately small: a history is read from the top and
 * most of it is never scrolled to.
 */
export function useListingHistory(id: ListingId | undefined, limit = 10) {
	const query = useInfiniteQuery({
		...getListingsByIdHistoryInfiniteOptions({ path: { id: id! }, query: { limit } }),
		...pagePagination,
		enabled: Boolean(id),
	})

	const entries = useMemo(() => flattenPages(query.data), [query.data])

	return { ...query, entries, totalCount: totalCountOf(query.data) }
}
