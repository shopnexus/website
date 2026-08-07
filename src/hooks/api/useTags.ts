"use client"

import { useQuery } from "@tanstack/react-query"
import { getTagsOptions } from "@/api/generated/@tanstack/react-query.gen"
import type { GetTagsData } from "@/api/generated/types.gen"
import { unwrapData } from "@/api/unwrap"

export type TagFilters = NonNullable<GetTagsData["query"]>

/**
 * The tag vocabulary.
 *
 * A tag's id is its slug, so nothing here needs resolving before it can be linked or sent
 * as `/listings?tag=`. `q` is a prefix match for a type-ahead and `near` ranks by
 * closeness to seeds — a category or another tag — which is how "related tags" is spelled
 * when there is no endpoint by that name.
 *
 * Public and slow-moving, so it is held for half an hour like the category tree.
 */
export function useTags(filters: TagFilters = {}) {
	return useQuery({
		...getTagsOptions({ query: filters }),
		select: unwrapData,
		staleTime: 30 * 60_000,
	})
}
