"use client"

import { useQuery } from "@tanstack/react-query"
import { getOptionsOptions } from "@/api/generated/@tanstack/react-query.gen"
import type { OptionCategoryName } from "@/api/generated/types.gen"

/**
 * The pluggable choices in one category — the payment rails a session may be tendered on,
 * the carriers a parcel may be sent with.
 *
 * The list is what the deployment actually has behind it: a row whose provider nobody
 * registered is left out, so this is the set that will really serve a checkout rather
 * than the set somebody once configured. Held indefinitely, because it changes when an
 * operator changes it and not otherwise.
 */
export function useOptions(category: OptionCategoryName) {
	return useQuery({
		...getOptionsOptions({ query: { category } }),
		select: (res) => res.data.options,
		staleTime: Infinity,
	})
}
