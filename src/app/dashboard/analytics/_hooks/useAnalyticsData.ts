"use client"

import { useMemo, useState } from "react"
import { useOrdersSummary } from "@/hooks/api/useOrdersSummary"
import { buildMetrics, countPlaced, fillDays, windowsFor } from "../_lib/summary.logic"
import type { AnalyticsView, RangeId, SummaryRole } from "../types"

/**
 * The analytics page's data.
 *
 * Two reads of the same endpoint, not one: the window on screen and the window before
 * it, which is where every "+12%" on this page comes from. Asking for both is the only
 * honest way to draw a comparison — the summary reports one window and nothing about
 * its history.
 *
 * The window boundary is frozen on mount rather than recomputed each render, so the
 * query key stays stable; a `Date.now()` inline would mint a new key every render and
 * refetch forever.
 */
export function useAnalyticsData(): AnalyticsView & {
	range: RangeId
	setRange: (r: RangeId) => void
	role: SummaryRole
	setRole: (r: SummaryRole) => void
} {
	const [range, setRange] = useState<RangeId>("30d")
	const [role, setRole] = useState<SummaryRole>("seller")
	const [anchor] = useState(() => Date.now())

	const { current, previous } = useMemo(() => windowsFor(range, anchor), [range, anchor])

	const currentQuery = useOrdersSummary(role, current.from, current.to)
	const previousQuery = useOrdersSummary(role, previous.from, previous.to)

	const metrics = useMemo(
		() => buildMetrics(currentQuery.data, previousQuery.data),
		[currentQuery.data, previousQuery.data],
	)

	const buckets = useMemo(
		() => fillDays(currentQuery.data?.daily ?? [], current.from, current.to),
		[currentQuery.data, current.from, current.to],
	)

	return {
		range,
		setRange,
		role,
		setRole,
		metrics,
		buckets,
		totals: currentQuery.data?.totals ?? [],
		isLoading: currentQuery.isLoading,
		isEmpty: Boolean(currentQuery.data) && countPlaced(currentQuery.data) === 0,
	}
}
