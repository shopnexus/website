"use client"

import { useQuery } from "@tanstack/react-query"
import { getAdministrativeAreasOptions } from "@/api/generated/@tanstack/react-query.gen"
import { unwrapData } from "@/api/unwrap"

/**
 * The administrative divisions an address is written in, from our own API.
 *
 * Two tiers and one level per request: Vietnam goes province to ward, so a saved address
 * names those two and nothing between them. `code` is the zero-padded string the columns
 * store ("01", "79", "26743") and is sent back exactly as it arrived — the third-party
 * dataset this replaced answered integers, which silently dropped every province below ten.
 */

// Administrative boundaries change on the order of years, and a stale name is a label
// rather than a wrong request — the code is what travels.
const AREA_QUERY = { staleTime: Infinity, gcTime: Infinity, meta: { silent: true } } as const

export function useProvinces() {
	return useQuery({
		...getAdministrativeAreasOptions(),
		select: unwrapData,
		...AREA_QUERY,
	})
}

/** A province's wards. Idle until a province is chosen, so nothing asks for "the wards of nowhere". */
export function useWards(provinceCode: string) {
	return useQuery({
		...getAdministrativeAreasOptions({ query: { parent: provinceCode } }),
		select: unwrapData,
		enabled: Boolean(provinceCode),
		...AREA_QUERY,
	})
}
