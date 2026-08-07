"use client"

import { useQuery } from "@tanstack/react-query"
import { getOrdersSummaryOptions } from "@/api/generated/@tanstack/react-query.gen"
import type { GetOrdersSummaryData } from "@/api/generated/types.gen"
import { unwrapData } from "@/api/unwrap"

type SummaryRole = NonNullable<GetOrdersSummaryData["query"]>["role"]

/**
 * Counts and daily buckets over the caller's own orders, on one side of them.
 *
 * The window is half-open — `to` is exclusive — and the buckets are cut in a named time
 * zone rather than UTC, which the spec is explicit about: a Vietnamese seller's evening
 * sales land on the next day otherwise. The browser's own zone is the honest default,
 * because it is the one the dates beside the chart are read in.
 */
export function useOrdersSummary(
	role: SummaryRole,
	from: string,
	to: string,
	enabled = true,
) {
	return useQuery({
		...getOrdersSummaryOptions({ query: { role, from, to, tz: browserTimeZone() } }),
		select: unwrapData,
		enabled,
	})
}

/** The viewer's IANA zone, or UTC where the runtime will not say. */
export function browserTimeZone(): string {
	return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
}
